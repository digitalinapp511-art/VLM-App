import Plan from '../../models/Plan.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// @desc    Get all subscription plans
// @route   GET /api/admin/plans
// @access  Private/Admin
export const adminGetPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, data: plans });
});

// @desc    Create a new subscription plan
// @route   POST /api/admin/plans
// @access  Private/Admin
export const adminCreatePlan = asyncHandler(async (req, res) => {
  const {
    name,
    class: targetClass,
    duration,
    mrp,
    price,
    benefits,
    grantPoints,
    grantCoins,
    customBenefits,
    trialDays,
    trialPrice,
    callRate,
    isActive,
    sortOrder
  } = req.body;

  // Validation
  if (!name || !targetClass || !duration) {
    return res.status(400).json({
      success: false,
      message: 'Name, class, and duration are required fields.'
    });
  }

  const plan = await Plan.create({
    name,
    class: targetClass,
    duration,
    mrp,
    price,
    benefits: {
      aiCredits: benefits?.aiCredits || 0,
      humanChatCredits: benefits?.humanChatCredits || 0,
      audioMinutes: benefits?.audioMinutes || 0,
      videoMinutes: benefits?.videoMinutes || 0,
      liveClassesPerMonth: benefits?.liveClassesPerMonth || 0,
      doubtsPerDay: benefits?.doubtsPerDay || 0,
      subjects: benefits?.subjects || [],
    },
    grantPoints: grantPoints !== undefined ? Number(grantPoints) : 0,
    grantCoins: grantCoins !== undefined ? Number(grantCoins) : 0,
    customBenefits: Array.isArray(customBenefits) ? customBenefits : [],
    trialDays: trialDays !== undefined ? Number(trialDays) : 3,
    trialPrice: trialPrice !== undefined ? Number(trialPrice) : 1,
    callRate: callRate !== undefined ? Number(callRate) : 4,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
  });

  res.status(201).json({ success: true, data: plan });
});

// @desc    Update a subscription plan
// @route   PUT /api/admin/plans/:id
// @access  Private/Admin
export const adminUpdatePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found.' });
  }

  const {
    name,
    class: targetClass,
    duration,
    mrp,
    price,
    benefits,
    grantPoints,
    grantCoins,
    customBenefits,
    trialDays,
    trialPrice,
    callRate,
    isActive,
    sortOrder
  } = req.body;

  const updateData = {};
  if (name !== undefined) updateData.name = name;
  if (targetClass !== undefined) updateData.class = targetClass;
  if (duration !== undefined) updateData.duration = duration;
  if (mrp !== undefined) updateData.mrp = mrp;
  if (price !== undefined) updateData.price = price;
  
  if (benefits !== undefined) {
    updateData.benefits = {
      aiCredits: benefits?.aiCredits !== undefined ? Number(benefits.aiCredits) : plan.benefits?.aiCredits || 0,
      humanChatCredits: benefits?.humanChatCredits !== undefined ? Number(benefits.humanChatCredits) : plan.benefits?.humanChatCredits || 0,
      audioMinutes: benefits?.audioMinutes !== undefined ? Number(benefits.audioMinutes) : plan.benefits?.audioMinutes || 0,
      videoMinutes: benefits?.videoMinutes !== undefined ? Number(benefits.videoMinutes) : plan.benefits?.videoMinutes || 0,
      liveClassesPerMonth: benefits?.liveClassesPerMonth !== undefined ? Number(benefits.liveClassesPerMonth) : plan.benefits?.liveClassesPerMonth || 0,
      doubtsPerDay: benefits?.doubtsPerDay !== undefined ? Number(benefits.doubtsPerDay) : plan.benefits?.doubtsPerDay || 0,
      subjects: benefits?.subjects !== undefined ? benefits.subjects : plan.benefits?.subjects || [],
    };
  }

  if (grantPoints !== undefined) updateData.grantPoints = Number(grantPoints);
  if (grantCoins !== undefined) updateData.grantCoins = Number(grantCoins);
  if (customBenefits !== undefined) updateData.customBenefits = Array.isArray(customBenefits) ? customBenefits : [];
  if (trialDays !== undefined) updateData.trialDays = Number(trialDays);
  if (trialPrice !== undefined) updateData.trialPrice = Number(trialPrice);
  if (callRate !== undefined) updateData.callRate = Number(callRate);
  if (isActive !== undefined) updateData.isActive = Boolean(isActive);
  if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder);

  const updatedPlan = await Plan.findByIdAndUpdate(
    req.params.id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: updatedPlan });
});

// @desc    Delete a subscription plan
// @route   DELETE /api/admin/plans/:id
// @access  Private/Admin
export const adminDeletePlan = asyncHandler(async (req, res) => {
  const plan = await Plan.findById(req.params.id);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found.' });
  }

  await Plan.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Subscription plan deleted successfully.' });
});

// @desc    Get subscription plans statistics
// @route   GET /api/admin/plans/stats
// @access  Private/Admin
export const adminGetPlanStats = asyncHandler(async (req, res) => {
  const Student = (await import('../../models/Student.js')).default;
  const Plan = (await import('../../models/Plan.js')).default;

  const plans = await Plan.find().lean();

  let overallActive = 0;
  let overallExpired = 0;
  let overallRevenue = 0;

  const planStatsPromises = plans.map(async (plan) => {
    const [activeCount, expiredCount] = await Promise.all([
      Student.countDocuments({
        'subscription.planId': plan._id,
        'subscription.status': { $in: ['active', 'trial'] }
      }),
      Student.countDocuments({
        'subscription.planId': plan._id,
        'subscription.status': 'expired'
      })
    ]);

    const planRevenue = (activeCount + expiredCount) * (plan.price || 0);

    overallActive += activeCount;
    overallExpired += expiredCount;
    overallRevenue += planRevenue;

    return {
      planId: plan._id,
      name: plan.name,
      class: plan.class,
      duration: plan.duration,
      price: plan.price,
      mrp: plan.mrp,
      activeSubscribers: activeCount,
      expiredSubscriptions: expiredCount,
      revenue: planRevenue
    };
  });

  const planStatistics = await Promise.all(planStatsPromises);

  res.json({
    success: true,
    data: {
      totalActiveSubscribers: overallActive,
      totalExpiredSubscriptions: overallExpired,
      totalRevenue: overallRevenue,
      planStatistics
    }
  });
});

// @desc    Get all students currently on trial (or expired trial)
// @route   GET /api/admin/plans/trials
// @access  Private/Admin
export const adminGetTrials = asyncHandler(async (req, res) => {
  const Student = (await import('../../models/Student.js')).default;

  const { status } = req.query; // 'trial', 'expired', or 'all'
  
  let query = {};
  if (status === 'expired') {
    query = {
      'subscription.status': { $in: ['trial', 'expired'] },
      'subscription.trialEndsAt': { $lt: new Date() }
    };
  } else if (status === 'trial') {
    query = {
      'subscription.status': 'trial',
      'subscription.trialEndsAt': { $gt: new Date() }
    };
  } else {
    query = {
      'subscription.status': { $in: ['trial', 'expired'] }
    };
  }

  const students = await Student.find(query)
    .populate('userId', 'firstName lastName email mobile')
    .populate('subscription.planId')
    .lean();

  const trialsList = students.map((student) => {
    const user = student.userId || {};
    const plan = student.subscription?.planId || {};
    const trialEndsAt = student.subscription?.trialEndsAt;
    
    const isExpired = trialEndsAt ? new Date(trialEndsAt) < new Date() : true;

    return {
      studentId: student._id,
      fullName: student.firstName ? `${student.firstName} ${student.lastName || ''}`.trim() : (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown'),
      email: student.email || user.email || 'N/A',
      mobile: student.mobile || user.mobile || 'N/A',
      class: student.class,
      board: student.board,
      subscriptionStatus: student.subscription?.status,
      trialEndsAt,
      isExpired,
      plan: {
        planId: plan._id || null,
        name: plan.name || 'N/A',
        price: plan.price || 0,
        mrp: plan.mrp || 0,
        trialPrice: plan.trialPrice || 1,
        trialDays: plan.trialDays || 3,
        duration: plan.duration || 'monthly',
      }
    };
  });

  res.json({
    success: true,
    count: trialsList.length,
    data: trialsList
  });
});
