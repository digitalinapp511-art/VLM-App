import Teacher from '../models/Teacher.js';
import Interview from '../models/Interview.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { TEACHER_STATUS } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';

export const getTeacherProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  res.json({ success: true, data: teacher });
});

export const updateOnboarding = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findOne({ userId: req.user._id });
  const { step, ...data } = req.body;

  if (!teacher) {
    teacher = await Teacher.create({
      userId: req.user._id,
      fullName: data.fullName || 'Teacher',
      onboardingStep: step || 1,
      ...data,
    });
  } else {
    Object.assign(teacher, data);
    if (step) teacher.onboardingStep = step;
    await teacher.save();
  }

  res.json({ success: true, data: teacher });
});

export const submitApplication = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Profile not found' });

  const required = ['fullName', 'subjects', 'classes', 'documents'];
  const missing = required.filter((f) => {
    if (f === 'documents') return !teacher.documents?.aadhaar;
    return !teacher[f]?.length && !teacher[f];
  });

  if (missing.length) {
    return res.status(400).json({ success: false, message: 'Missing required fields', missing });
  }

  teacher.applicationStatus = TEACHER_STATUS.SUBMITTED;
  teacher.onboardingStep = 10;
  await teacher.save();

  await createNotification(req.user._id, 'profile_update', 'Application Submitted', 'Your application is under review.');

  res.json({ success: true, data: teacher, message: 'Application submitted for verification' });
});

export const getApplicationStatus = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: { status: teacher.applicationStatus, rejectionReason: teacher.rejectionReason, reapplyAfter: teacher.reapplyAfter } });
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const { availabilityStatus, availabilitySlots } = req.body;
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Not found' });

  if (availabilityStatus) teacher.availabilityStatus = availabilityStatus;
  if (availabilitySlots) teacher.availabilitySlots = availabilitySlots;
  await teacher.save();

  res.json({ success: true, data: teacher });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Not found' });

  res.json({
    success: true,
    data: {
      todayEarnings: teacher.metrics.todayEarnings,
      totalPoints: teacher.wallet.totalPoints,
      walletBalance: teacher.wallet.withdrawableBalance,
      availabilityStatus: teacher.availabilityStatus,
      totalSessions: teacher.metrics.totalSessions,
      missedRequests: teacher.metrics.missedRequests,
      rating: teacher.metrics.rating,
      performanceScore: teacher.metrics.performanceScore,
      responseSpeed: teacher.metrics.responseSpeed,
      weeklyLiveTarget: teacher.metrics.weeklyLiveTarget,
      weeklyLiveCompleted: teacher.metrics.weeklyLiveCompleted,
      applicationStatus: teacher.applicationStatus,
      isApproved: teacher.isApproved,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Not found' });

  const allowed = ['bio', 'teachingStyle', 'bankDetails', 'qualification', 'experience'];
  allowed.forEach((key) => {
    if (req.body[key]) teacher[key] = { ...teacher[key]?.toObject?.() || teacher[key], ...req.body[key] };
  });
  await teacher.save();
  res.json({ success: true, data: teacher });
});

export const scheduleInterview = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const { scheduledAt } = req.body;

  const interview = await Interview.create({
    teacherId: teacher._id,
    scheduledAt: new Date(scheduledAt),
    status: 'scheduled',
    slotRequestedBy: 'teacher',
  });

  teacher.applicationStatus = TEACHER_STATUS.INTERVIEW_SCHEDULED;
  teacher.interview = { scheduledAt: new Date(scheduledAt), slotId: interview._id, status: 'scheduled' };
  await teacher.save();

  res.json({ success: true, data: interview });
});

export const getInterviewSlots = asyncHandler(async (req, res) => {
  const slots = [];
  const now = new Date();
  for (let d = 1; d <= 7; d++) {
    const date = new Date(now);
    date.setDate(date.getDate() + d);
    ['10:00', '14:00', '16:00'].forEach((time) => {
      const [h, m] = time.split(':');
      const slot = new Date(date);
      slot.setHours(parseInt(h), parseInt(m), 0, 0);
      slots.push({ id: `${d}-${time}`, datetime: slot, available: true });
    });
  }
  res.json({ success: true, data: slots });
});
