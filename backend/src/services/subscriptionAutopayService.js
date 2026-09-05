/**
 * subscriptionAutopayService.js
 *
 * REPLACED: The old broken 10-minute polling setInterval loop.
 *
 * NEW ARCHITECTURE:
 * - Primary: Razorpay Webhooks (webhookController.js) handle all real-time events instantly.
 * - Fallback: This daily recovery cron runs once at 2 AM to catch any subscriptions
 *   that webhooks may have missed (network failures, server downtime, etc.).
 *
 * This approach eliminates the race condition where users are shown the subscription
 * page because the 10-min poller hasn't run yet after Razorpay charges them.
 */

import Student from '../models/Student.js';
import Plan from '../models/Plan.js';
import { getRazorpay } from './razorpayService.js';
import { createNotification } from './notificationService.js';
import WalletTransaction from '../models/WalletTransaction.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: Compute next run time at 2 AM IST
// ─────────────────────────────────────────────────────────────────────────────
const getNextRunDelay = () => {
  const now = new Date();
  // IST = UTC + 5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);

  const target = new Date(istNow);
  target.setUTCHours(20, 30, 0, 0); // 20:30 UTC = 02:00 IST

  if (target <= istNow) {
    // Already past 2 AM today — run tomorrow
    target.setUTCDate(target.getUTCDate() + 1);
  }

  // Convert back to UTC delay
  return target.getTime() - istNow.getTime();
};

// ─────────────────────────────────────────────────────────────────────────────
//  Daily Recovery Job — reconcile missed webhook events
// ─────────────────────────────────────────────────────────────────────────────
const runDailyRecovery = async () => {
  console.log('[SubscriptionRecovery] Starting daily subscription reconciliation...');

  try {
    const now = new Date();
    const razorpay = getRazorpay();

    // Find students whose trial or subscription dates have passed but status hasn't been updated
    // (indicates a missed webhook)
    const staleStudents = await Student.find({
      $or: [
        // Trial ended but status still 'trial'
        { 'subscription.status': 'trial', 'subscription.trialEndsAt': { $lte: now } },
        // Active subscription expired but status still 'active' (no autopay)
        {
          'subscription.status': 'active',
          'subscription.expiresAt': { $lte: now },
          'subscription.cancelAtPeriodEnd': false,
        },
        // CancelAtPeriodEnd and period has ended
        {
          'subscription.status': 'active',
          'subscription.expiresAt': { $lte: now },
          'subscription.cancelAtPeriodEnd': true,
        },
      ],
    }).populate('subscription.planId');

    let processed = 0;
    let errors = 0;

    for (const student of staleStudents) {
      const sub = student.subscription;

      try {
        // ── Handle cancelAtPeriodEnd expiry ────────────────────────────────
        if (sub.cancelAtPeriodEnd && sub.expiresAt && sub.expiresAt <= now) {
          student.subscription.status = 'cancelled';
          student.markModified('subscription');
          await student.save();
          console.log(`[SubscriptionRecovery] Student ${student._id} cancel-at-period-end completed`);
          processed++;
          continue;
        }

        if (!sub.razorpaySubscriptionId) {
          // No Razorpay sub — just expire
          student.subscription.status = 'expired';
          student.markModified('subscription');
          await student.save();
          processed++;
          continue;
        }

        // ── Fetch live status from Razorpay ───────────────────────────────
        let rzpSub;
        try {
          rzpSub = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
        } catch (err) {
          console.error(`[SubscriptionRecovery] Failed to fetch ${sub.razorpaySubscriptionId}:`, err.message);
          errors++;
          continue;
        }

        const plan = sub.planId;
        const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
        const days = plan ? (durationMap[plan.duration] || 30) : 30;

        if (rzpSub.status === 'active') {
          // ── Autopay charged and renewed — update DB ─────────────────────
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);

          const wasOnTrial = sub.status === 'trial';
          student.subscription.status = 'active';
          student.subscription.expiresAt = expiresAt;
          student.subscription.lastRenewalAt = now;
          student.subscription.trialEndsAt = undefined;
          student.subscription.autopayEnabled = true;
          student.markModified('subscription');

          // Grant plan benefits
          const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
          const aiCredits = plan?.benefits?.aiCredits ?? (classNum >= 11 ? 3000 : classNum >= 9 ? 2000 : 1000);
          student.wallet.aiCredits = (student.wallet.aiCredits || 0) + aiCredits;
          if (plan?.benefits?.humanChatCredits) student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + plan.benefits.humanChatCredits;
          if (plan?.benefits?.audioMinutes) student.wallet.audioMinutes = (student.wallet.audioMinutes || 0) + plan.benefits.audioMinutes;
          if (plan?.benefits?.videoMinutes) student.wallet.videoMinutes = (student.wallet.videoMinutes || 0) + plan.benefits.videoMinutes;
          student.markModified('wallet');
          await student.save();

          await WalletTransaction.create({
            userId: student.userId,
            role: 'student',
            type: 'credit',
            points: plan?.grantPoints || 0,
            aiCredits,
            humanChatCredits: plan?.benefits?.humanChatCredits || 0,
            inrAmount: plan?.price || 0,
            earningType: 'purchase',
            description: `[Recovery] ${wasOnTrial ? 'Trial→Active' : 'Renewal'}: ${plan?.name || 'Plan'} | ${sub.razorpaySubscriptionId}`,
            status: 'credited',
          });

          await createNotification(
            student.userId,
            'student',
            wasOnTrial ? "🎉 You're Now Premium!" : '🔄 Subscription Renewed!',
            wasOnTrial
              ? `Your subscription "${plan?.name || 'Premium'}" is active until ${expiresAt.toLocaleDateString('en-IN')}.`
              : `Your plan renewed. Active until ${expiresAt.toLocaleDateString('en-IN')}.`,
            { type: 'reward' }
          );

          console.log(`[SubscriptionRecovery] Student ${student._id} updated to active (${wasOnTrial ? 'trial→active' : 'renewal'})`);

        } else if (['halted', 'cancelled', 'expired', 'completed'].includes(rzpSub.status)) {
          // ── Autopay failed or subscription ended ──────────────────────
          student.subscription.status = 'expired';
          student.subscription.autopayEnabled = false;
          student.markModified('subscription');
          await student.save();

          await createNotification(
            student.userId,
            'student',
            '⌛ Subscription Expired',
            'Your subscription has expired. Resubscribe to continue learning!',
            { type: 'alert' }
          );

          console.log(`[SubscriptionRecovery] Student ${student._id} marked expired (Razorpay status: ${rzpSub.status})`);
        }
        // If status is 'pending' or 'authenticated', leave it — Razorpay is still processing

        processed++;
      } catch (innerErr) {
        console.error(`[SubscriptionRecovery] Error processing student ${student._id}:`, innerErr.message);
        errors++;
      }
    }

    console.log(`[SubscriptionRecovery] Done. Processed: ${processed}, Errors: ${errors}, Total stale: ${staleStudents.length}`);

  } catch (err) {
    console.error('[SubscriptionRecovery] Fatal error in daily job:', err.message);
  }

  // Schedule next run
  const nextDelay = getNextRunDelay();
  const nextRunAt = new Date(Date.now() + nextDelay);
  console.log(`[SubscriptionRecovery] Next run scheduled at: ${nextRunAt.toISOString()} (in ${Math.round(nextDelay / 3600000)}h)`);
  setTimeout(runDailyRecovery, nextDelay);
};

// ─────────────────────────────────────────────────────────────────────────────
//  Start the Daily Recovery Scheduler
// ─────────────────────────────────────────────────────────────────────────────
export const startSubscriptionAutopayScheduler = () => {
  console.log('[SubscriptionRecovery] Initializing daily recovery scheduler...');
  console.log('[SubscriptionRecovery] Primary sync: Razorpay Webhooks (POST /api/webhooks/razorpay)');
  console.log('[SubscriptionRecovery] Fallback sync: Daily job at 2:00 AM IST');

  const firstRunDelay = getNextRunDelay();
  const firstRunAt = new Date(Date.now() + firstRunDelay);
  console.log(`[SubscriptionRecovery] First run scheduled at: ${firstRunAt.toISOString()}`);

  setTimeout(runDailyRecovery, firstRunDelay);
};
