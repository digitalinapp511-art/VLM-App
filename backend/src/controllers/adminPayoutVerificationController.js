import Teacher from '../models/Teacher.js';
import Interview from '../models/Interview.js';
import Document from '../models/Document.js';
import PayoutRecord from '../models/PayoutRecord.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @route GET /api/admin/teachers/pending-verification
 * @desc Get all pending teacher verification applications
 */
export const getPendingVerifications = asyncHandler(async (req, res) => {
  const pendingTeachers = await Teacher.find({
    $or: [
      { applicationStatus: { $in: ['pending_interview', 'under_review', 'submitted', 'draft'] } },
      { 'pendingClassUpgrade.status': 'pending_interview' },
    ],
  }).populate('userId', 'email mobile fullName profilePhoto');

  const teacherIds = pendingTeachers.map(t => t._id);
  const interviews = await Interview.find({ teacherId: { $in: teacherIds } });
  const documents = await Document.find({ teacherId: { $in: teacherIds } });

  const result = pendingTeachers.map(teacher => {
    const tObj = teacher.toObject();
    tObj.interviews = interviews.filter(i => i.teacherId.toString() === teacher._id.toString());
    tObj.documents = documents.filter(d => d.teacherId.toString() === teacher._id.toString());
    return tObj;
  });

  res.json({ success: true, data: result });
});

/**
 * @route GET /api/admin/interview-slots/settings
 * @desc Get admin configured available interview days & time slots
 */
export const getInterviewSlotSettings = asyncHandler(async (req, res) => {
  const AdminSettings = (await import('../models/AdminSettings.js')).default;
  let settings = await AdminSettings.findOne({ key: 'interview_slot_config' });

  if (!settings) {
    settings = await AdminSettings.create({
      key: 'interview_slot_config',
      value: {
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], // Working days
        timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'],
        maxBookingsPerSlot: 3,
      },
      category: 'interview',
      description: 'Admin configured days and time slots for teacher verification interviews',
    });
  }

  res.json({ success: true, data: settings.value });
});

/**
 * @route PUT /api/admin/interview-slots/settings
 * @desc Admin configures available interview days and time slots
 */
export const updateInterviewSlotSettings = asyncHandler(async (req, res) => {
  const { availableDays, timeSlots, maxBookingsPerSlot } = req.body;
  const AdminSettings = (await import('../models/AdminSettings.js')).default;

  const settings = await AdminSettings.findOneAndUpdate(
    { key: 'interview_slot_config' },
    {
      value: {
        availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: timeSlots || ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'],
        maxBookingsPerSlot: maxBookingsPerSlot || 3,
      },
    },
    { upsert: true, new: true }
  );

  res.json({ success: true, message: 'Interview slot settings updated successfully', data: settings.value });
});

/**
 * @route POST /api/admin/teachers/reschedule-interview
 * @desc Admin reschedules a teacher interview and sends notification
 */
export const adminRescheduleInterview = asyncHandler(async (req, res) => {
  const { interviewId, newScheduledAt, reason } = req.body;
  const Notification = (await import('../models/Notification.js')).default;

  const interview = await Interview.findById(interviewId).populate('teacherId');
  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview not found' });
  }

  interview.scheduledAt = new Date(newScheduledAt);
  interview.status = 'rescheduled';
  interview.adminNotes = reason || 'Rescheduled by admin.';
  await interview.save();

  const teacher = interview.teacherId;
  if (teacher) {
    teacher.interview.scheduledAt = interview.scheduledAt;
    teacher.interview.status = 'rescheduled';
    await teacher.save();

    // Send Notification to Teacher
    const formattedDate = new Date(newScheduledAt).toLocaleString();
    await Notification.create({
      userId: teacher.userId,
      title: 'Interview Rescheduled by Admin',
      message: `Your verification interview has been rescheduled to ${formattedDate}. Reason: ${reason || 'Admin slot adjustment'}. Please check your onboarding dashboard to join.`,
      type: 'interview_rescheduled',
    });
  }

  res.json({
    success: true,
    message: 'Interview rescheduled successfully and notification sent to teacher.',
    data: interview,
  });
});

/**
 * @route POST /api/admin/teachers/verify
 * @desc Admin/Sub-admin approves or rejects teacher after interview
 */
export const adminVerifyTeacher = asyncHandler(async (req, res) => {
  const { teacherId, decision, approvedClasses, rejectionReason, interviewId, notes } = req.body;
  const Notification = (await import('../models/Notification.js')).default;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  }

  if (interviewId) {
    const interview = await Interview.findById(interviewId);
    if (interview) {
      interview.status = 'completed';
      interview.result = decision === 'approve' ? 'passed' : 'failed';
      interview.adminNotes = notes || '';
      interview.interviewerId = req.user._id;
      await interview.save();
    }
  }

  if (decision === 'approve') {
    teacher.isApproved = true;
    teacher.applicationStatus = 'approved';
    teacher.rejectionReason = '';

    const newClasses = approvedClasses || teacher.classes || ['9', '10', '11', '12'];
    teacher.classes = Array.from(new Set([...(teacher.classes || []), ...newClasses]));
    teacher.verifiedClasses = Array.from(new Set([...(teacher.verifiedClasses || []), ...newClasses]));

    if (teacher.pendingClassUpgrade && teacher.pendingClassUpgrade.status === 'pending_interview') {
      teacher.pendingClassUpgrade.status = 'approved';
    }

    // Send Approval Notification to Teacher
    await Notification.create({
      userId: teacher.userId,
      title: 'Interview Approved & Profile Verified!',
      message: 'Congratulations! Your verification interview has been approved. You are now live and can start receiving call requests from students.',
      type: 'interview_approved',
    });
  } else {
    teacher.isApproved = false;
    teacher.applicationStatus = 'rejected';
    teacher.rejectionReason = rejectionReason || 'Verification interview criteria not met.';

    if (teacher.pendingClassUpgrade && teacher.pendingClassUpgrade.status === 'pending_interview') {
      teacher.pendingClassUpgrade.status = 'rejected';
      teacher.pendingClassUpgrade.rejectionReason = rejectionReason;
    }

    // Send Rejection Notification to Teacher
    await Notification.create({
      userId: teacher.userId,
      title: 'Interview Update',
      message: `Your verification application status: ${rejectionReason || 'Interview criteria not met'}. You can re-apply or contact support.`,
      type: 'interview_rejected',
    });
  }

  await teacher.save();

  res.json({
    success: true,
    message: `Teacher application ${decision === 'approve' ? 'approved' : 'rejected'} successfully. Notifications sent.`,
    data: teacher,
  });
});

/**
 * @route GET /api/admin/payouts/pending
 * @desc Get list of all teacher wallet balances eligible for manual weekly payout
 */
export const getPendingPayouts = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find({
    'wallet.withdrawableBalance': { $gt: 0 },
  }).populate('userId', 'fullName email mobile');

  const formatted = teachers.map(t => ({
    teacherId: t._id,
    userId: t.userId?._id,
    teacherName: t.fullName || `${t.firstName} ${t.lastName}`,
    vlmTeacherId: t.vlmTeacherId,
    email: t.email || t.userId?.email,
    mobile: t.userId?.mobile,
    withdrawableBalance: t.wallet?.withdrawableBalance || 0,
    bankDetails: t.bankDetails || {},
  }));

  res.json({ success: true, data: formatted });
});

/**
 * @route POST /api/admin/payouts/process
 * @desc Admin submits manual payment transaction reference (UTR) for a teacher
 */
export const processTeacherPayout = asyncHandler(async (req, res) => {
  const { teacherId, amount, transactionReference, notes, periodStart, periodEnd } = req.body;

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  }

  const payoutAmount = Number(amount);
  if (isNaN(payoutAmount) || payoutAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid payout amount' });
  }

  if ((teacher.wallet?.withdrawableBalance || 0) < payoutAmount) {
    return res.status(400).json({ success: false, message: 'Payout amount exceeds withdrawable balance' });
  }

  // Record payout
  const payout = await PayoutRecord.create({
    teacherId: teacher._id,
    userId: teacher.userId,
    amount: payoutAmount,
    payoutPeriodStart: periodStart ? new Date(periodStart) : undefined,
    payoutPeriodEnd: periodEnd ? new Date(periodEnd) : undefined,
    bankSnapshot: teacher.bankDetails || {},
    transactionReference,
    status: 'PAID',
    paidBy: req.user._id,
    notes,
  });

  // Deduct from withdrawable balance
  teacher.wallet.withdrawableBalance -= payoutAmount;
  await teacher.save();

  res.json({
    success: true,
    message: `Payout of ₹${payoutAmount} processed successfully for ${teacher.firstName} ${teacher.lastName}.`,
    data: payout,
  });
});

/**
 * @route GET /api/admin/payouts/history
 * @desc Fetch completed manual payout records
 */
export const getPayoutHistory = asyncHandler(async (req, res) => {
  const history = await PayoutRecord.find()
    .populate('teacherId', 'firstName lastName vlmTeacherId')
    .populate('paidBy', 'fullName email')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: history });
});
