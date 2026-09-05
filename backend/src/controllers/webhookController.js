import crypto from 'crypto';
import Student from '../models/Student.js';
import Plan from '../models/Plan.js';
import WalletTransaction from '../models/WalletTransaction.js';
import { createNotification } from '../services/notificationService.js';

// ─────────────────────────────────────────────────────────────────────────────
//  Verify Razorpay Webhook Signature
// ─────────────────────────────────────────────────────────────────────────────
const verifyWebhookSignature = (rawBody, signature) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Webhook] RAZORPAY_WEBHOOK_SECRET is not set in environment variables!');
    return false;
  }
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return expectedSignature === signature;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: Grant plan benefits to student wallet
// ─────────────────────────────────────────────────────────────────────────────
const grantPlanBenefits = async (student, plan) => {
  const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
  const aiCredits = plan?.benefits?.aiCredits ?? (classNum >= 11 ? 3000 : classNum >= 9 ? 2000 : 1000);

  student.wallet.aiCredits = (student.wallet.aiCredits || 0) + aiCredits;
  if (plan?.benefits?.humanChatCredits) {
    student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + plan.benefits.humanChatCredits;
  }
  if (plan?.benefits?.audioMinutes) {
    student.wallet.audioMinutes = (student.wallet.audioMinutes || 0) + plan.benefits.audioMinutes;
  }
  if (plan?.benefits?.videoMinutes) {
    student.wallet.videoMinutes = (student.wallet.videoMinutes || 0) + plan.benefits.videoMinutes;
  }
  student.markModified('wallet');
  return aiCredits;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Webhook Handler
//  POST /api/webhooks/razorpay
//  NOTE: This route must receive the raw body (before JSON parsing)
// ─────────────────────────────────────────────────────────────────────────────
export const handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];

  if (!signature) {
    console.warn('[Webhook] Missing x-razorpay-signature header');
    return res.status(400).json({ success: false, message: 'Missing signature header' });
  }

  // req.rawBody is the Buffer set by the raw body middleware in app.js
  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error('[Webhook] rawBody not available — check app.js raw body middleware setup');
    return res.status(500).json({ success: false, message: 'Raw body not captured' });
  }

  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[Webhook] Invalid signature — rejecting event');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  // Parse the verified body
  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch (err) {
    console.error('[Webhook] Failed to parse event body:', err.message);
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  const eventType = event.event;
  const payload = event.payload;

  console.log(`[Webhook] Received event: ${eventType}`);

  // Respond immediately to Razorpay — processing happens below
  // (Razorpay expects a 200 quickly, or it will retry)
  res.status(200).json({ success: true, received: true });

  // ── Process the event asynchronously ──────────────────────────────────────
  try {
    switch (eventType) {

      // ── subscription.charged ──────────────────────────────────────────────
      // Fired when autopay successfully charges the user (both trial→paid and monthly renewals)
      case 'subscription.charged': {
        const sub = payload?.subscription?.entity;
        const payment = payload?.payment?.entity;
        if (!sub?.id) break;

        const razorpaySubscriptionId = sub.id;

        const student = await Student.findOne({
          'subscription.razorpaySubscriptionId': razorpaySubscriptionId,
        }).populate('subscription.planId');

        if (!student) {
          console.warn(`[Webhook] subscription.charged: No student found for subscription ${razorpaySubscriptionId}`);
          break;
        }

        const plan = student.subscription.planId;
        const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
        const days = plan ? (durationMap[plan.duration] || 30) : 30;

        const now = new Date();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);

        const wasOnTrial = student.subscription.status === 'trial';

        // Update subscription to active
        student.subscription.status = 'active';
        student.subscription.expiresAt = expiresAt;
        student.subscription.lastRenewalAt = now;
        student.subscription.trialEndsAt = undefined;
        student.subscription.autopayEnabled = true;
        student.markModified('subscription');

        // Grant plan benefits for this billing cycle
        const aiCredits = await grantPlanBenefits(student, plan);
        await student.save();

        // Record wallet transaction
        const paymentAmount = payment ? payment.amount / 100 : (plan?.price || 0);
        await WalletTransaction.create({
          userId: student.userId,
          role: 'student',
          type: 'credit',
          points: plan?.grantPoints || 0,
          aiCredits: aiCredits || 0,
          humanChatCredits: plan?.benefits?.humanChatCredits || 0,
          inrAmount: paymentAmount,
          earningType: 'purchase',
          description: wasOnTrial
            ? `Trial ended — Subscription activated: ${plan?.name || 'Plan'} | Sub ID: ${razorpaySubscriptionId}`
            : `Subscription renewed: ${plan?.name || 'Plan'} | Sub ID: ${razorpaySubscriptionId}`,
          status: 'credited',
        });

        // Notify student
        await createNotification(
          student.userId,
          'student',
          wasOnTrial ? "🎉 Trial Ended — You're Now Premium!" : '🔄 Subscription Renewed!',
          wasOnTrial
            ? `Your 3-day trial ended and your plan "${plan?.name || 'Premium'}" is now active until ${expiresAt.toLocaleDateString('en-IN')}.`
            : `Your plan "${plan?.name || 'Premium'}" renewed successfully. Active until ${expiresAt.toLocaleDateString('en-IN')}.`,
          { type: 'reward' }
        );

        console.log(`[Webhook] subscription.charged processed for student ${student._id} — ${wasOnTrial ? 'trial→active' : 'renewal'}. Expires: ${expiresAt.toISOString()}`);
        break;
      }

      // ── subscription.halted ───────────────────────────────────────────────
      // Fired when autopay payment fails repeatedly and Razorpay halts the subscription
      case 'subscription.halted': {
        const sub = payload?.subscription?.entity;
        if (!sub?.id) break;

        const student = await Student.findOne({ 'subscription.razorpaySubscriptionId': sub.id });
        if (!student) break;

        student.subscription.status = 'expired';
        student.markModified('subscription');
        await student.save();

        await createNotification(
          student.userId,
          'student',
          '⚠️ Subscription Payment Failed',
          "We couldn't collect your autopay payment. Your subscription has been paused. Please update your payment method or resubscribe.",
          { type: 'alert' }
        );

        console.log(`[Webhook] subscription.halted — student ${student._id} marked expired`);
        break;
      }

      // ── subscription.cancelled ────────────────────────────────────────────
      // Fired when user or admin cancels the subscription on Razorpay
      case 'subscription.cancelled': {
        const sub = payload?.subscription?.entity;
        if (!sub?.id) break;

        const student = await Student.findOne({ 'subscription.razorpaySubscriptionId': sub.id });
        if (!student) break;

        const now = new Date();

        // If cancelAtPeriodEnd was requested, keep access until expiresAt
        if (student.subscription.cancelAtPeriodEnd && student.subscription.expiresAt && student.subscription.expiresAt > now) {
          student.subscription.cancelledAt = now;
          student.subscription.autopayEnabled = false;
          // Status stays 'active' until expiresAt — daily cron will flip it to 'cancelled' on expiry
          student.markModified('subscription');
          await student.save();

          await createNotification(
            student.userId,
            'student',
            '📋 Subscription Cancelled',
            `Your subscription has been cancelled. You'll continue to have premium access until ${student.subscription.expiresAt.toLocaleDateString('en-IN')}.`,
            { type: 'info' }
          );
        } else {
          student.subscription.status = 'cancelled';
          student.subscription.cancelledAt = now;
          student.subscription.autopayEnabled = false;
          student.markModified('subscription');
          await student.save();

          await createNotification(
            student.userId,
            'student',
            '📋 Subscription Cancelled',
            'Your subscription has been cancelled. Resubscribe anytime to regain premium access.',
            { type: 'info' }
          );
        }

        console.log(`[Webhook] subscription.cancelled — student ${student._id}`);
        break;
      }

      // ── subscription.pending ──────────────────────────────────────────────
      // Fired when autopay is pending (e.g., UPI pending state, bank processing)
      case 'subscription.pending': {
        const sub = payload?.subscription?.entity;
        if (!sub?.id) break;

        const student = await Student.findOne({ 'subscription.razorpaySubscriptionId': sub.id });
        if (!student) break;

        await createNotification(
          student.userId,
          'student',
          '⏳ Payment Processing',
          'Your subscription payment is being processed. It may take a few minutes. Your access will continue uninterrupted.',
          { type: 'info' }
        );

        console.log(`[Webhook] subscription.pending — student ${student._id}`);
        break;
      }

      // ── subscription.completed ────────────────────────────────────────────
      // Fired when all billing cycles of a subscription are exhausted
      case 'subscription.completed': {
        const sub = payload?.subscription?.entity;
        if (!sub?.id) break;

        const student = await Student.findOne({ 'subscription.razorpaySubscriptionId': sub.id });
        if (!student) break;

        student.subscription.status = 'expired';
        student.subscription.autopayEnabled = false;
        student.markModified('subscription');
        await student.save();

        await createNotification(
          student.userId,
          'student',
          '⌛ Subscription Completed',
          'Your subscription has completed all billing cycles. Renew now to keep learning!',
          { type: 'alert' }
        );

        console.log(`[Webhook] subscription.completed — student ${student._id}`);
        break;
      }

      // ── payment.failed ────────────────────────────────────────────────────
      // Fired for any payment failure (used for logging/alerting, not status change)
      case 'payment.failed': {
        const payment = payload?.payment?.entity;
        const subscriptionId = payment?.subscription_id;
        if (!subscriptionId) break;

        const student = await Student.findOne({ 'subscription.razorpaySubscriptionId': subscriptionId });
        if (!student) break;

        const reason = payment?.error_description || payment?.error_reason || 'Unknown reason';

        await createNotification(
          student.userId,
          'student',
          '❌ Payment Failed',
          `Your autopay payment failed: ${reason}. Razorpay will retry automatically, or you can pay manually.`,
          { type: 'alert' }
        );

        console.log(`[Webhook] payment.failed for subscription ${subscriptionId} — reason: ${reason}`);
        break;
      }

      default:
        console.log(`[Webhook] Unhandled event type: ${eventType} — ignoring`);
    }
  } catch (err) {
    // We've already sent 200 to Razorpay, so just log the internal error
    console.error(`[Webhook] Error processing event ${eventType}:`, err.message, err.stack);
  }
};
