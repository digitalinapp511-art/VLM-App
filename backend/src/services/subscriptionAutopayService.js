import Student from '../models/Student.js';
import Plan from '../models/Plan.js';
import { getRazorpay } from './razorpayService.js';
import { createNotification } from './notificationService.js';
import WalletTransaction from '../models/WalletTransaction.js';

export const startSubscriptionAutopayScheduler = () => {
  console.log('[SubscriptionAutopayScheduler] Initializing autopay subscription checker (every 10 minutes)...');

  setInterval(async () => {
    try {
      const now = new Date();
      // Find students whose subscription status is 'trial' or 'active' (active but close to expiry or expired)
      // and who have a razorpaySubscriptionId.
      const trialOrActiveStudents = await Student.find({
        'subscription.status': { $in: ['trial', 'active'] },
        'subscription.razorpaySubscriptionId': { $ne: null }
      }).populate('subscription.planId');

      for (const student of trialOrActiveStudents) {
        const sub = student.subscription;
        const razorpay = getRazorpay();

        let rzpSub;
        try {
          rzpSub = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
        } catch (err) {
          console.error(`[SubscriptionAutopayScheduler] Failed to fetch subscription ${sub.razorpaySubscriptionId} from Razorpay:`, err.message);
          continue;
        }

        // Razorpay Subscription statuses: created, authenticated, active, pending, halted, cancelled, completed, expired
        if (sub.status === 'trial') {
          // If trial has ended, we check if the subscription is active/charged
          const hasTrialEnded = sub.trialEndsAt && sub.trialEndsAt <= now;
          
          if (hasTrialEnded) {
            // Check if Razorpay shows it as active/authenticated and at least one billing cycle has started or charge succeeded
            if (rzpSub.status === 'active' || rzpSub.status === 'authenticated') {
              const plan = sub.planId;
              if (plan) {
                const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
                const days = durationMap[plan.duration] || 30;
                
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + days);

                student.subscription.status = 'active';
                student.subscription.expiresAt = expiresAt;
                student.subscription.trialEndsAt = undefined;
                student.markModified('subscription');

                // Grant plan benefits (for the actual plan since the charge happened!)
                const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
                let aiCredits = plan.benefits?.aiCredits ?? (classNum >= 11 ? 3000 : classNum >= 9 ? 2000 : 1000);

                student.wallet.aiCredits = (student.wallet.aiCredits || 0) + aiCredits;
                if (plan.benefits?.humanChatCredits) {
                  student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + plan.benefits.humanChatCredits;
                }
                if (plan.benefits?.audioMinutes) {
                  student.wallet.audioMinutes = (student.wallet.audioMinutes || 0) + plan.benefits.audioMinutes;
                }
                if (plan.benefits?.videoMinutes) {
                  student.wallet.videoMinutes = (student.wallet.videoMinutes || 0) + plan.benefits.videoMinutes;
                }
                student.markModified('wallet');
                await student.save();

                // Record transaction
                await WalletTransaction.create({
                  userId: student.userId,
                  role: 'student',
                  type: 'credit',
                  points: plan.grantPoints || 0,
                  aiCredits: aiCredits || 0,
                  humanChatCredits: plan.benefits?.humanChatCredits || 0,
                  inrAmount: plan.price,
                  earningType: 'purchase',
                  description: `Autopay Subscription Charge Succeeded: ${plan.name} | Subscription ID: ${sub.razorpaySubscriptionId}`,
                  status: 'credited',
                });

                // Notify student
                await createNotification(
                  student.userId,
                  'student',
                  '💳 Autopay Payment Successful!',
                  `Your trial has ended and subscription plan "${plan.name}" is now active. Enjoy premium features!`,
                  { type: 'reward' }
                );

                console.log(`[SubscriptionAutopayScheduler] Student ${student._id} trial ended and subscription activated via Autopay.`);
              }
            } else if (['cancelled', 'expired', 'halted'].includes(rzpSub.status)) {
              // Mandate failed or was cancelled
              student.subscription.status = 'expired';
              student.subscription.trialEndsAt = undefined;
              student.markModified('subscription');
              await student.save();

              // Notify student
              await createNotification(
                student.userId,
                'student',
                '⚠️ Autopay Payment Failed',
                `Your trial has ended, but we couldn't charge your card/UPI for the subscription. Please subscribe again.`,
                { type: 'alert' }
              );

              console.log(`[SubscriptionAutopayScheduler] Student ${student._id} trial ended, autopay failed.`);
            }
          }
        } else if (sub.status === 'active') {
          // If active subscription is expired, check if it has been renewed or cancelled
          const hasExpired = sub.expiresAt && sub.expiresAt <= now;
          if (hasExpired) {
            if (rzpSub.status === 'active') {
              // Subscription has renewed (new cycle started)
              const plan = sub.planId;
              if (plan) {
                const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
                const days = durationMap[plan.duration] || 30;
                
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + days);

                student.subscription.expiresAt = expiresAt;
                student.markModified('subscription');

                // Grant plan benefits for the new cycle
                const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
                let aiCredits = plan.benefits?.aiCredits ?? (classNum >= 11 ? 3000 : classNum >= 9 ? 2000 : 1000);

                student.wallet.aiCredits = (student.wallet.aiCredits || 0) + aiCredits;
                if (plan.benefits?.humanChatCredits) {
                  student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + plan.benefits.humanChatCredits;
                }
                if (plan.benefits?.audioMinutes) {
                  student.wallet.audioMinutes = (student.wallet.audioMinutes || 0) + plan.benefits.audioMinutes;
                }
                if (plan.benefits?.videoMinutes) {
                  student.wallet.videoMinutes = (student.wallet.videoMinutes || 0) + plan.benefits.videoMinutes;
                }
                student.markModified('wallet');
                await student.save();

                // Record transaction
                await WalletTransaction.create({
                  userId: student.userId,
                  role: 'student',
                  type: 'credit',
                  points: plan.grantPoints || 0,
                  aiCredits: aiCredits || 0,
                  humanChatCredits: plan.benefits?.humanChatCredits || 0,
                  inrAmount: plan.price,
                  earningType: 'purchase',
                  description: `Autopay Subscription Renewal Succeeded: ${plan.name} | Subscription ID: ${sub.razorpaySubscriptionId}`,
                  status: 'credited',
                });

                // Notify
                await createNotification(
                  student.userId,
                  'student',
                  '🔄 Subscription Renewed!',
                  `Your monthly subscription for "${plan.name}" has renewed successfully.`,
                  { type: 'reward' }
                );

                console.log(`[SubscriptionAutopayScheduler] Student ${student._id} active subscription renewed via Autopay.`);
              }
            } else {
              // Razorpay subscription is no longer active, so mark as expired
              student.subscription.status = 'expired';
              student.markModified('subscription');
              await student.save();

              // Notify
              await createNotification(
                student.userId,
                'student',
                '⌛ Subscription Expired',
                `Your subscription has expired. Please renew to continue learning.`,
                { type: 'alert' }
              );

              console.log(`[SubscriptionAutopayScheduler] Student ${student._id} subscription expired.`);
            }
          }
        }
      }
    } catch (err) {
      console.error('[SubscriptionAutopayScheduler] Error in subscription checker loop:', err);
    }
  }, 10 * 60 * 1000); // Check every 10 minutes
};
