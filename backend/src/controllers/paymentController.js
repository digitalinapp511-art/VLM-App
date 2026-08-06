import { asyncHandler } from '../middleware/errorHandler.js';
import { createOrder, verifySignature } from '../services/razorpayService.js';
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

  let plan = null;
  try {
    if (planId) plan = await Plan.findById(planId);
  } catch (e) {
    plan = null;
  }

  // Fallback: find active monthly plan for student's class
  if (!plan) {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const classNum = parseInt((student.class || '10').replace(/\D/g, ''), 10) || 10;
    let classRange = '9-10';
    if (classNum >= 1 && classNum <= 8) classRange = '1-8';
    else if (classNum >= 11 && classNum <= 12) classRange = '11-12';

    plan = await Plan.findOne({ class: classRange, duration: 'monthly', isActive: true });
  }

  if (!plan) {
    return res.status(404).json({ success: false, message: 'No active plan found for your class' });
  }

  // For trial: charge trialPrice (₹1), for subscription: charge plan.price
  const amount = isTrial ? (plan.trialPrice || 1) : plan.price;

  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid plan price' });
  }

  const type = isTrial ? 'trial' : 'subscription';
  const receipt = `sub_${req.user._id.toString().slice(-8)}_${Date.now()}`;

  const order = await createOrder(amount, receipt, 'INR', {
    userId: req.user._id.toString(),
    planId: plan._id.toString(),
    type,
  });

  await PaymentOrder.create({
    userId: req.user._id,
    type,
    razorpayOrderId: order.id,
    amount,
    currency: 'INR',
    status: 'created',
    planId: plan._id,
  });

  res.json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount, // in paise
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      planName: plan.name,
      planId: plan._id,
      isTrial,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
//  SUBSCRIPTION — Verify Payment & Activate Plan
//  POST /api/student/payment/subscription/verify
// ─────────────────────────────────────────────────────────────────────────────
export const verifySubscriptionPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  // 1. Verify signature
  const isValid = verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed.' });
  }

  // 2. Find the pending order
  const paymentRecord = await PaymentOrder.findOne({
    razorpayOrderId: razorpay_order_id,
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

  // 3. Activate plan / trial
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
    ...(isTrial ? { trialEndsAt: expiresAt } : { expiresAt }),
    autopayEnabled: false,
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
    description: `${isTrial ? 'Trial' : 'Subscription'} activated: ${plan?.name || 'Plan'} | Payment ID: ${razorpay_payment_id}`,
    status: 'credited',
  });

  // 6. Send notification
  await createNotification(
    req.user._id,
    'student',
    isTrial ? '🎓 Trial Activated!' : '🎉 Subscription Active!',
    isTrial
      ? `Your ${trialDays}-day trial has started. Enjoy all premium features!`
      : `Your ${plan?.name || 'subscription'} is now active until ${expiresAt.toLocaleDateString('en-IN')}.`,
    { type: 'reward' }
  );

  res.json({
    success: true,
    message: isTrial ? 'Trial activated successfully!' : 'Subscription activated successfully!',
    data: student,
  });
});
