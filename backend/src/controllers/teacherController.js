import Teacher from '../models/Teacher.js';
import Interview from '../models/Interview.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import Review from '../models/Review.js';
import LiveClass from '../models/LiveClass.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { TEACHER_STATUS } from '../config/constants.js';
import { createNotification } from '../services/notificationService.js';
import { generateVlmId } from '../utils/vlmIdGenerator.js';

export const getTeacherProfile = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findOne({ userId: req.user._id }).populate('userId', 'email mobile fullName');
  if (!teacher) {
    const vlmTeacherId = await generateVlmId('TCH');
    teacher = await Teacher.create({
      userId: req.user._id,
      vlmTeacherId,
      fullName: req.user.fullName || 'Teacher',
      applicationStatus: 'draft',
    });
    teacher = await Teacher.findOne({ userId: req.user._id }).populate('userId', 'email mobile fullName');
  }
  
  const teacherObj = teacher.toObject();
  teacherObj.user = teacherObj.userId; // Map populated User document to p.user
  
  res.json({ success: true, data: teacherObj });
});

export const updateOnboarding = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findOne({ userId: req.user._id });
  const { step, ...data } = req.body;

  if (!teacher) {
    const vlmTeacherId = await generateVlmId('TCH');
    teacher = await Teacher.create({
      userId: req.user._id,
      vlmTeacherId,
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
  const availabilityStatus = req.body.availabilityStatus || req.body.status;
  const { availabilitySlots } = req.body;
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

  const unreadNotifications = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(5);
  const recentReviews = await Review.find({ teacherId: teacher._id }).populate('studentId').sort({ createdAt: -1 }).limit(5);

  const upcomingRaw = await LiveClass.find({
    teacherId: teacher._id,
    status: 'approved',
    scheduledAt: { $gte: new Date() }
  })
    .sort({ scheduledAt: 1 })
    .limit(3);

  const upcomingClasses = upcomingRaw.map((c) => ({
    id: c._id,
    type: `${c.subject} - ${c.topic}`,
    student: `${c.class} (${c.language})`,
    startedAt: c.scheduledAt,
    duration: c.duration || 30,
  }));

  res.json({
    success: true,
    data: {
      teacher: {
        name: teacher.fullName,
        availabilityStatus: teacher.availabilityStatus,
        profilePhoto: teacher.profilePhoto,
        applicationStatus: teacher.applicationStatus,
        isApproved: teacher.isApproved,
      },
      stats: {
        todayEarnings: teacher.metrics.todayEarnings,
        totalPoints: teacher.wallet.totalPoints,
        walletBalance: teacher.wallet.withdrawableBalance,
        rating: teacher.metrics.rating,
        totalSessions: teacher.metrics.totalSessions,
        missedRequests: teacher.metrics.missedRequests || 0,
        performanceScore: teacher.metrics.performanceScore,
        responseSpeed: teacher.metrics.responseSpeed || 85,
        weeklyLiveTarget: teacher.metrics.weeklyLiveTarget || 10,
        weeklyLiveCompleted: teacher.metrics.weeklyLiveCompleted || 0,
      },
      unreadNotifications,
      notifications,
      recentReviews,
      upcomingClasses
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  let teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    teacher = await Teacher.create({
      userId: req.user._id,
      fullName: req.body.fullName || req.user.fullName || 'Teacher',
      applicationStatus: 'draft',
    });
  }

  const allowed = [
    'fullName', 'bio', 'teachingStyle', 'bankDetails', 'profilePhoto', 
    'address', 'city', 'state', 'pincode', 'gender', 'dob',
    'subjects', 'classes', 'boards', 'languages'
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) {
      teacher[key] = req.body[key];
    }
  });

  if (req.body.qualification) {
    if (!teacher.qualification) teacher.qualification = {};
    const qAllowed = ['highestQualification', 'instituteName', 'passingYear', 'hasBEd', 'teachingCertification', 'additionalCertifications', 'certificateUrl'];
    qAllowed.forEach((key) => {
      if (req.body.qualification[key] !== undefined) {
        teacher.qualification[key] = req.body.qualification[key];
      }
    });
  }

  if (req.body.experience) {
    if (!teacher.experience) teacher.experience = {};
    const eAllowed = ['totalYears', 'isFresher', 'teachingModes', 'experienceTypes', 'summary', 'resumeUrl'];
    eAllowed.forEach((key) => {
      if (req.body.experience[key] !== undefined) {
        teacher.experience[key] = req.body.experience[key];
      }
    });
  }

  if (req.body.documents) {
    if (!teacher.documents) teacher.documents = {};
    const dAllowed = ['aadhaar', 'qualificationCert', 'experienceProof', 'resume', 'additional'];
    dAllowed.forEach((key) => {
      if (req.body.documents[key] !== undefined) {
        teacher.documents[key] = req.body.documents[key];
      }
    });
  }

  if (req.body.applicationStatus !== undefined) {
    teacher.applicationStatus = req.body.applicationStatus;
  }

  await teacher.save();

  // Also update email and mobile on User model if provided
  const user = await User.findById(req.user._id);
  if (user) {
    if (req.body.email !== undefined) {
      user.email = req.body.email && req.body.email.trim() !== "" ? req.body.email.trim() : undefined;
    }
    if (req.body.mobile !== undefined) {
      user.mobile = req.body.mobile && req.body.mobile.trim() !== "" ? req.body.mobile.trim() : undefined;
    }
    try {
      await user.save();
    } catch (err) {
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0];
        return res.status(400).json({ 
          success: false, 
          message: `${field === 'email' ? 'Email address' : 'Mobile number'} is already registered to another account.` 
        });
      }
      throw err;
    }
  }

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
