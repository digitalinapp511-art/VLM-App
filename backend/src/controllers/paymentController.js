import { asyncHandler } from '../middleware/errorHandler.js';
import { createOrder, verifySignature, getRazorpay, verifySubscriptionSignature } from '../services/razorpayService.js';
import { createNotification } from '../services/notificationService.js';
import PaymentOrder from '../models/PaymentOrder.js';
import Student from '../models/Student.js';
import Plan from '../models/Plan.js';
import WalletTransaction from '../models/WalletTransaction.js';
import CashbackOffer from '../models/CashbackOffer.js';

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET RECHARGE — Create Order
//  POST /api/student/payment/wallet/create-order
// ─────────────────────────────────────────────────────────────────────────────
export const createWalletOrder = asyncHandler(async (req, res) => {
  const { amount, aiCredits, humanChatCredits, redeemedPoints } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid recharge amount' });
  }

  // receipt must be unique and ≤ 40 chars (Razorpay limit)
  const receipt = `wlt_${req.user._id.toString().slice(-8)}_${Date.now()}`;

  const order = await createOrder(amount, receipt, 'INR', {
    userId: req.user._id.toString(),
    type: 'wallet_recharge',
  });

  // Save pending order to DB
  await PaymentOrder.create({
    userId: req.user._id,
    type: 'wallet_recharge',
    razorpayOrderId: order.id,
    amount,
    currency: 'INR',
    status: 'created',
    walletPayload: { amount, aiCredits, humanChatCredits, redeemedPoints },
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount, // in paise
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  WALLET RECHARGE — Verify Payment & Credit Wallet
//  POST /api/student/payment/wallet/verify
// ─────────────────────────────────────────────────────────────────────────────
export const verifyWalletPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. Verify signature
  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed. Do not credit wallet.' });
  }

  // 2. Find the pending order
  const paymentRecord = await PaymentOrder.findOne({
    razorpayOrderId: razorpay_order_id,
    userId: req.user._id,
    type: 'wallet_recharge',
    status: 'created',
  });

  if (!paymentRecord) {
    return res.status(404).json({ success: false, message: 'Payment order not found or already processed' });
  }

  // 3. Extract wallet payload
  const { amount, aiCredits, humanChatCredits, redeemedPoints } = paymentRecord.walletPayload || {};

  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // 4. Update wallet
  student.wallet.balance = (student.wallet.balance || 0) + (amount || 0);

  if (redeemedPoints) {
    student.wallet.totalPoints = Math.max(0, student.wallet.totalPoints - redeemedPoints);
    student.totalPoints = Math.max(0, student.totalPoints - redeemedPoints);
  }

  if (aiCredits) student.wallet.aiCredits = (student.wallet.aiCredits || 0) + aiCredits;
  if (humanChatCredits) student.wallet.humanChatCredits = (student.wallet.humanChatCredits || 0) + humanChatCredits;

  // 5. AUTO-CASHBACK: find best applicable active offer
  let appliedCashback = 0;
  let cashbackOfferApplied = null;

  if (amount > 0) {
    const now = new Date();
    const offers = await CashbackOffer.find({
      isActive: true,
      minRechargeAmount: { $lte: amount },
      $or: [{ validUntil: null }, { validUntil: { $gte: now } }],
    }).sort({ minRechargeAmount: -1 });

    for (const offer of offers) {
      if (offer.usageLimit > 0 && offer.usedCount >= offer.usageLimit) continue;

      if (offer.perUserLimit > 0) {
        const userUsageCount = await WalletTransaction.countDocuments({
          userId: req.user._id,
          'metadata.cashbackOfferId': offer._id,
          earningType: 'cashback',
        });
        if (userUsageCount >= offer.perUserLimit) continue;
      }

      if (offer.cashbackPercent > 0) {
        appliedCashback = Math.round((amount * offer.cashbackPercent) / 100);
        if (offer.maxCashback > 0) appliedCashback = Math.min(appliedCashback, offer.maxCashback);
      } else {
        appliedCashback = offer.cashbackAmount;
      }

      cashbackOfferApplied = offer;
      break;
    }

    if (appliedCashback > 0 && cashbackOfferApplied) {
      student.wallet.balance = (student.wallet.balance || 0) + appliedCashback;
      cashbackOfferApplied.usedCount = (cashbackOfferApplied.usedCount || 0) + 1;
      await cashbackOfferApplied.save();
    }
  }

  student.markModified('wallet');
  await student.save();

  // 6. Mark payment order as paid
  paymentRecord.razorpayPaymentId = razorpay_payment_id;
  paymentRecord.razorpaySignature = razorpay_signature;
  paymentRecord.status = 'paid';
  await paymentRecord.save();

  // 7. Create wallet transaction records
  await WalletTransaction.create({
    userId: req.user._id,
    role: 'student',
    type: 'credit',
    points: 0,
    inrAmount: amount || 0,
    aiCredits: aiCredits || 0,
    humanChatCredits: humanChatCredits || 0,
    earningType: 'purchase',
    description: `Recharge: ${aiCredits || 0} AI Credits / ${humanChatCredits || 0} Doubt Credits | Payment ID: ${razorpay_payment_id}`,
    status: 'credited',
  });

  if (appliedCashback > 0 && cashbackOfferApplied) {
    await WalletTransaction.create({
      userId: req.user._id,
      role: 'student',
      type: 'credit',
      points: 0,
      inrAmount: appliedCashback,
      earningType: 'cashback',
      description: `🎉 Cashback: ${cashbackOfferApplied.title} — ₹${appliedCashback} added!`,
      metadata: { cashbackOfferId: cashbackOfferApplied._id },
      status: 'credited',
    });

    // Push in-app notification
    await createNotification(
      req.user._id,
      'student',
      '🎉 Cashback Credited!',
      `₹${appliedCashback} cashback from "${cashbackOfferApplied.title}" has been added to your wallet.`,
      { type: 'reward' }
    );
  }

  if (redeemedPoints) {
    await WalletTransaction.create({
      userId: req.user._id,
      role: 'student',
      type: 'debit',
      points: -redeemedPoints,
      inrAmount: 0,
      earningType: 'redeem',
      description: `Redeemed points discount for recharge`,
      status: 'credited',
    });
  }

  res.json({
    success: true,
    message: appliedCashback > 0
      ? `Recharge successful! ₹${appliedCashback} cashback added 🎉`
      : 'Recharge successful!',
    data: student,
    cashback: appliedCashback > 0 ? { amount: appliedCashback, offer: cashbackOfferApplied?.title } : null,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION — Create Order
//  POST /api/student/payment/subscription/create-order
// ─────────────────────────────────────────────────────────────────────────────
export const createSubscriptionOrder = asyncHandler(async (req, res) => {
  const { planId, isTrial } = req.body;

  // ── 1. Load student first (needed for checks below) ──────────────────────
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // ── 2. GUARD: Block duplicate ₹1 trial (root cause of timeout errors) ────
  if (isTrial && student.subscription?.hasUsedTrial) {
    return res.status(400).json({
      success: false,
      message: 'TRIAL_ALREADY_USED',
      hint: 'You have already used the free trial. Please purchase the full subscription.',
    });
  }

  // ── 3. GUARD: Block creating duplicate subscription when one is active ────
  const existingSubId = student.subscription?.razorpaySubscriptionId;
  if (existingSubId && ['trial', 'active'].includes(student.subscription?.status)) {
    // Double-check with Razorpay live status
    try {
      const razorpay = getRazorpay();
      const rzpSub = await razorpay.subscriptions.fetch(existingSubId);
      if (['created', 'authenticated', 'active'].includes(rzpSub.status)) {
        return res.status(400).json({
          success: false,
          message: 'SUBSCRIPTION_ALREADY_ACTIVE',
          hint: 'You already have an active subscription. No need to pay again.',
        });
      }
    } catch (err) {
      // If fetch fails, allow proceeding (sub may have been deleted from Razorpay)
      console.warn(`[Payment] Could not verify existing subscription ${existingSubId}:`, err.message);
    }
  }

  // ── 4. Load plan ──────────────────────────────────────────────────────────
  let plan = null;
  try {
    if (planId) plan = await Plan.findById(planId);
  } catch (e) {
    plan = null;
  }

  // Fallback: find active monthly plan for student's class
  if (!plan) {
    const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
    let classRange = '9-10';
    if (classNum >= 1 && classNum <= 8) classRange = '1-8';
    else if (classNum >= 11 && classNum <= 12) classRange = '11-12';

    plan = await Plan.findOne({ class: classRange, duration: 'monthly', isActive: true });
  }

  if (!plan) {
    return res.status(404).json({ success: false, message: 'No active plan found for your class' });
  }

  // 1. Ensure Razorpay Plan exists
  const razorpay = getRazorpay();
  if (!plan.razorpayPlanId) {
    let period = 'monthly';
    let interval = 1;
    if (plan.duration === 'quarterly') {
      period = 'monthly';
      interval = 3;
    } else if (plan.duration === 'yearly') {
      period = 'yearly';
      interval = 1;
    }

    try {
      const rzpPlan = await razorpay.plans.create({
        period,
        interval,
        item: {
          name: plan.name,
          amount: Math.round(plan.price * 100), // in paise
          currency: 'INR',
        },
      });
      plan.razorpayPlanId = rzpPlan.id;
      await plan.save();
      console.log(`[Razorpay] Plan created on Razorpay: ${rzpPlan.id} for plan ${plan._id}`);
    } catch (err) {
      console.error('[Razorpay] Failed to create Razorpay Plan:', err.message);
      return res.status(500).json({ success: false, message: 'Failed to create plan on payment gateway: ' + err.message });
    }
  }

  // 2. Create subscription
  let rzpSubscription = null;
  const trialDays = plan.trialDays || 3;
  const totalCount = plan.duration === 'yearly' ? 5 : 60; // 5 years or 60 months

  try {
    const subOptions = {
      plan_id: plan.razorpayPlanId,
      total_count: totalCount,
      quantity: 1,
      customer_notify: 1,
      notes: {
        userId: req.user._id.toString(),
        planId: plan._id.toString(),
        isTrial: isTrial ? 'true' : 'false',
      }
    };

    if (isTrial) {
      // Trial begins immediately; recurring bill starts 3 days from now
      subOptions.start_at = Math.floor(Date.now() / 1000) + (trialDays * 24 * 60 * 60);
      subOptions.addons = [
        {
          item: {
            name: "Trial Activation Fee",
            amount: 100, // ₹1 in paise
            currency: "INR"
          }
        }
      ];
    }

    rzpSubscription = await razorpay.subscriptions.create(subOptions);
  } catch (err) {
    console.error('[Razorpay] Failed to create subscription:', err.message);
    return res.status(500).json({ success: false, message: 'Failed to create subscription on Razorpay: ' + err.message });
  }

  // Create a pending payment order record
  await PaymentOrder.create({
    userId: req.user._id,
    type: isTrial ? 'trial' : 'subscription',
    razorpayOrderId: rzpSubscription.id, // using subscription id as unique key
    amount: isTrial ? (plan.trialPrice || 1) : plan.price,
    currency: 'INR',
    status: 'created',
    planId: plan._id,
  });

  res.json({
    success: true,
    data: {
      subscriptionId: rzpSubscription.id,
      amount: isTrial ? 100 : Math.round(plan.price * 100), // in paise
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
      planId: plan._id,
      isTrial,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION — Log Payment Failure / Cancellation
//  POST /api/student/payment/subscription/log-failure
// ─────────────────────────────────────────────────────────────────────────────
export const logPaymentFailure = asyncHandler(async (req, res) => {
  const { subscriptionId, orderId, reason, description } = req.body;
  const targetId = subscriptionId || orderId;
  if (targetId) {
    await PaymentOrder.updateOne(
      { razorpayOrderId: targetId, userId: req.user._id, status: 'created' },
      { $set: { status: 'failed', failureReason: reason || description || 'user_cancelled' } }
    );
  }
  res.json({ success: true, message: 'Payment failure logged.' });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION — Verify Payment & Activate Plan
//  POST /api/student/payment/subscription/verify
// ─────────────────────────────────────────────────────────────────────────────
export const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_subscription_id, razorpay_payment_id, razorpay_signature } = req.body;

  const isSubscriptionFlow = !!razorpay_subscription_id;
  const targetId = isSubscriptionFlow ? razorpay_subscription_id : razorpay_order_id;

  // 1. Verify signature
  let isValid = false;
  if (isSubscriptionFlow) {
    isValid = verifySubscriptionSignature(razorpay_subscription_id, razorpay_payment_id, razorpay_signature);
  } else {
    isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  }

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
  }

  // 2. Find the pending order
  const paymentRecord = await PaymentOrder.findOne({
    razorpayOrderId: targetId,
    userId: req.user._id,
    status: 'created',
  }).populate('planId');

  if (!paymentRecord) {
    return res.status(404).json({ success: false, message: 'Payment order not found or already processed' });
  }

  const plan = paymentRecord.planId;
  const isTrial = paymentRecord.type === 'trial';

  const student = await Student.findOne({ userId: req.user._id });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  // ── 3. Activate plan / trial ──────────────────────────────────────────────
  const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
  const trialDays = plan ? (plan.trialDays ?? 3) : 3;

  const expiresAt = new Date();
  if (isTrial) {
    expiresAt.setDate(expiresAt.getDate() + trialDays);
  } else {
    const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
    const days = plan ? (durationMap[plan.duration] || 30) : 30;
    expiresAt.setDate(expiresAt.getDate() + days);
  }

  // Determine AI credits
  let aiCredits = plan?.benefits?.aiCredits ?? (classNum >= 11 ? 3000 : classNum >= 9 ? 2000 : 1000);

  student.subscription = {
    planId: plan?._id || null,
    status: isTrial ? 'trial' : 'active',
    trialEndsAt: isTrial ? expiresAt : student.subscription?.trialEndsAt,
    expiresAt: isTrial ? (student.subscription?.expiresAt || null) : expiresAt,
    autopayEnabled: true,
    razorpaySubscriptionId: isSubscriptionFlow ? razorpay_subscription_id : null,
    // Permanently mark trial as used so they can never get ₹1 trial again
    hasUsedTrial: Boolean(student.subscription?.hasUsedTrial || isTrial),
    cancelledAt: null,
    cancelAtPeriodEnd: false,
    lastRenewalAt: isTrial ? null : new Date(),
  };

  // Grant plan benefits
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

  // Award plan bonus points/coins
  if (plan?.grantPoints) {
    student.totalPoints = (student.totalPoints || 0) + plan.grantPoints;
  }
  if (plan?.grantCoins) {
    student.wallet.totalPoints = (student.wallet.totalPoints || 0) + plan.grantCoins;
  }

  student.markModified('wallet');
  student.markModified('subscription');
  await student.save();

  // 4. Mark payment order as paid
  paymentRecord.razorpayPaymentId = razorpay_payment_id;
  paymentRecord.razorpaySignature = razorpay_signature;
  paymentRecord.status = 'paid';
  await paymentRecord.save();

  // 5. Record transaction
  await WalletTransaction.create({
    userId: req.user._id,
    role: 'student',
    type: 'credit',
    points: plan?.grantPoints || 0,
    aiCredits: aiCredits || 0,
    humanChatCredits: plan?.benefits?.humanChatCredits || 0,
    inrAmount: paymentRecord.amount,
    earningType: 'purchase',
    description: `${isTrial ? 'Trial' : 'Subscription'} activated: ${plan?.name || 'Plan'} | Subscription ID: ${targetId}`,
    status: 'credited',
  });

  // 6. Send notification
  try {
    await createNotification(
      req.user._id,
      'subscription_renewal',
      isTrial ? '🎓 Trial Activated!' : '🎉 Subscription Active!',
      isTrial
        ? `Your ${trialDays}-day trial has started. Enjoy all premium features!`
        : `Your ${plan?.name || 'subscription'} is now active until ${expiresAt.toLocaleDateString('en-IN')}.`,
      { deepLink: '/student-dashboard' },
      '/student-dashboard'
    );
  } catch (notifErr) {
    console.error('[Payment Notification Error]:', notifErr.message);
  }

  res.json({
    success: true,
    message: isTrial ? 'Trial activated successfully!' : 'Subscription activated successfully!',
    data: student,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION — Get Live Status (sync Razorpay → DB on app open)
//  GET /api/student/payment/subscription/status
// ─────────────────────────────────────────────────────────────────────────────
export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id }).populate('subscription.planId');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const sub = student.subscription;
  const now = new Date();

  // ── Fix ghost-premium: if dates say expired but status still says active ──
  let statusChanged = false;
  if (sub.status === 'trial' && sub.trialEndsAt && sub.trialEndsAt <= now) {
    // Trial date passed — check Razorpay to see if autopay charged
    if (sub.razorpaySubscriptionId) {
      try {
        const razorpay = getRazorpay();
        const rzpSub = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
        if (rzpSub.status === 'active') {
          // Autopay charged successfully — update DB (webhook may have missed)
          const plan = sub.planId;
          const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
          const days = plan ? (durationMap[plan.duration] || 30) : 30;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
          student.subscription.status = 'active';
          student.subscription.expiresAt = expiresAt;
          student.subscription.trialEndsAt = undefined;
          student.subscription.lastRenewalAt = now;
          statusChanged = true;
        } else if (['halted', 'cancelled', 'expired'].includes(rzpSub.status)) {
          student.subscription.status = 'expired';
          statusChanged = true;
        }
      } catch (err) {
        console.warn('[SubscriptionStatus] Razorpay fetch failed:', err.message);
        // Fall through — don't crash the app open
      }
    } else {
      student.subscription.status = 'expired';
      statusChanged = true;
    }
  } else if (sub.status === 'active' && sub.expiresAt && sub.expiresAt <= now) {
    // Active subscription date passed — check Razorpay for renewal
    if (sub.razorpaySubscriptionId) {
      try {
        const razorpay = getRazorpay();
        const rzpSub = await razorpay.subscriptions.fetch(sub.razorpaySubscriptionId);
        if (rzpSub.status === 'active') {
          // Renewed — extend expiresAt (webhook may have missed)
          const plan = sub.planId;
          const durationMap = { monthly: 30, quarterly: 90, yearly: 365 };
          const days = plan ? (durationMap[plan.duration] || 30) : 30;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + days);
          student.subscription.expiresAt = expiresAt;
          student.subscription.lastRenewalAt = now;
          statusChanged = true;
        } else if (['halted', 'cancelled', 'expired', 'completed'].includes(rzpSub.status)) {
          student.subscription.status = 'expired';
          statusChanged = true;
        }
      } catch (err) {
        console.warn('[SubscriptionStatus] Razorpay fetch failed:', err.message);
      }
    } else {
      student.subscription.status = 'expired';
      statusChanged = true;
    }
  }

  // If cancelAtPeriodEnd and the period is now over, mark as cancelled
  if (sub.cancelAtPeriodEnd && sub.expiresAt && sub.expiresAt <= now) {
    student.subscription.status = 'cancelled';
    statusChanged = true;
  }

  if (statusChanged) {
    student.markModified('subscription');
    await student.save();
  }

  const updatedSub = student.subscription;
  const plan = updatedSub.planId;

  res.json({
    success: true,
    data: {
      status: updatedSub.status,
      isPremium: ['trial', 'active'].includes(updatedSub.status),
      hasUsedTrial: updatedSub.hasUsedTrial || false,
      autopayEnabled: updatedSub.autopayEnabled || false,
      expiresAt: updatedSub.expiresAt || null,
      trialEndsAt: updatedSub.trialEndsAt || null,
      cancelledAt: updatedSub.cancelledAt || null,
      cancelAtPeriodEnd: updatedSub.cancelAtPeriodEnd || false,
      lastRenewalAt: updatedSub.lastRenewalAt || null,
      plan: plan ? { id: plan._id, name: plan.name, price: plan.price, duration: plan.duration } : null,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION — Cancel (self-service cancel at period end)
//  POST /api/student/payment/subscription/cancel
// ─────────────────────────────────────────────────────────────────────────────
export const cancelSubscription = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ userId: req.user._id });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const sub = student.subscription;

  // 1. If Razorpay subscription ID exists, attempt cancellation via Razorpay API
  if (sub?.razorpaySubscriptionId) {
    try {
      const razorpay = getRazorpay();
      // cancel_at_cycle_end: 1 → user keeps access until current period ends
      await razorpay.subscriptions.cancel(sub.razorpaySubscriptionId, { cancel_at_cycle_end: 1 });
    } catch (err) {
      console.warn('[CancelSubscription] Razorpay cancel notice (proceeding with DB update):', err.message);
    }
  }

  // 2. Always update local database state to cancel auto-pay & stop auto-renewal
  if (student.subscription) {
    student.subscription.cancelAtPeriodEnd = true;
    student.subscription.cancelledAt = new Date();
    student.subscription.autopayEnabled = false;
    student.markModified('subscription');
    await student.save();
  }

  const rawExp = sub?.expiresAt || sub?.trialEndsAt;
  let formattedDate = null;
  if (rawExp && !isNaN(new Date(rawExp).getTime())) {
    formattedDate = new Date(rawExp).toLocaleDateString('en-IN');
  }

  res.json({
    success: true,
    message: formattedDate
      ? `Auto-pay cancelled successfully. You will maintain premium access until ${formattedDate}.`
      : 'Auto-pay cancelled successfully.',
    data: {
      cancelAtPeriodEnd: true,
      accessUntil: rawExp || null,
    },
  });
});
