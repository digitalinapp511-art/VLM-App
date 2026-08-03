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
      { applicationStatus: { $in: ['pending_interview', 'under_review', 'submitted', 'interview_pending', 'interview_scheduled'] } },
      { 'pendingClassUpgrade.status': 'pending_interview' },
    ],
  }).populate('userId', 'email mobile fullName profilePhoto');

  const teacherIds = pendingTeachers.map(t => t._id);
  const interviews = await Interview.find({ teacherId: { $in: teacherIds } });
  const documents = await Document.find({ teacherId: { $in: teacherIds } });

  const result = pendingTeachers.map(teacher => {
    const tObj = teacher.toObject();
    tObj.interviews = interviews.filter(i => i.teacherId && i.teacherId.toString() === teacher._id.toString());
    const docs = [];
    const docRecord = documents.find(d => d.teacherId && d.teacherId.toString() === teacher._id.toString());
    if (docRecord) {
      ['aadhaar', 'qualificationCert', 'experienceProof', 'resume'].forEach(type => {
        if (docRecord[type] && docRecord[type].url) {
          docs.push({
            type,
            name: docRecord[type].name || type,
            url: docRecord[type].url,
            status: docRecord[type].status || 'pending',
            rejectionReason: docRecord[type].rejectionReason
          });
        }
      });

      if (Array.isArray(docRecord.additional)) {
        docRecord.additional.forEach(file => {
          if (file && file.url) {
            docs.push({
              type: 'additional',
              name: file.name || 'additional',
              url: file.url,
              status: file.status || 'pending',
              rejectionReason: file.rejectionReason
            });
          }
        });
      }
    }
    tObj.documents = docs;
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
        timeSlots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'],
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
        timeSlots: timeSlots || ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'],
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
  const { interviewId, teacherId, newScheduledAt, scheduledAt, reason } = req.body;
  const Notification = (await import('../models/Notification.js')).default;
  const dateToSchedule = newScheduledAt || scheduledAt || new Date();

  let targetId = interviewId || teacherId;
  let interview = null;

  if (targetId) {
    interview = await Interview.findById(targetId).populate('teacherId');
  }

  if (!interview && targetId) {
    interview = await Interview.findOne({ teacherId: targetId }).sort({ createdAt: -1 }).populate('teacherId');
  }

  if (!interview && targetId) {
    const teacherDoc = await Teacher.findById(targetId);
    if (teacherDoc) {
      const agoraChannelName = `interview_${teacherDoc._id}_${Date.now()}`;
      interview = await Interview.create({
        teacherId: teacherDoc._id,
        scheduledAt: new Date(dateToSchedule),
        slotRequestedBy: 'admin',
        agoraChannelName,
        status: 'scheduled',
        type: 'onboarding'
      });
      interview.teacherId = teacherDoc;
    }
  }

  if (!interview) {
    return res.status(404).json({ success: false, message: 'Teacher or Interview session not found' });
  }

  interview.scheduledAt = new Date(dateToSchedule);
  interview.status = 'scheduled';
  interview.adminNotes = reason || 'Scheduled / Rescheduled by admin.';
  await interview.save();

  const teacher = interview.teacherId && interview.teacherId._id ? interview.teacherId : await Teacher.findById(interview.teacherId);
  if (teacher) {
    if (!teacher.interview) teacher.interview = {};
    teacher.interview.scheduledAt = interview.scheduledAt;
    teacher.interview.slotId = interview._id;
    teacher.interview.status = 'scheduled';
    teacher.interview.agoraChannelName = interview.agoraChannelName || `interview_${teacher._id}`;
    teacher.applicationStatus = 'interview_scheduled';
    await teacher.save();

    // Send Notification to Teacher
    const formattedDate = new Date(dateToSchedule).toLocaleString();
    await Notification.create({
      userId: teacher.userId,
      title: 'Interview Scheduled / Updated by Admin',
      message: `Your verification interview is set for ${formattedDate}. Reason: ${reason || 'Slot confirmed'}. Please check your onboarding dashboard to join.`,
      type: 'interview_scheduled',
    });
  }

  res.json({
    success: true,
    message: 'Interview scheduled successfully and notification sent to teacher.',
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

  if (teacher.applicationStatus === 'draft') {
    return res.status(400).json({ success: false, message: 'Cannot verify a teacher with incomplete (draft) profile.' });
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
    $or: [
      { 'wallet.withdrawableBalance': { $gt: 0 } },
      { 'bankDetails.accountNumber': { $exists: true, $ne: '' } },
      { 'bankDetails.upiId': { $exists: true, $ne: '' } }
    ]
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

/**
 * @route POST /api/admin/teachers/confirm-interview
 * @desc Admin confirms/approves a pending teacher interview slot
 */
export const adminConfirmInterview = asyncHandler(async (req, res) => {
  const { interviewId, teacherId } = req.body;
  const Notification = (await import('../models/Notification.js')).default;

  let targetId = interviewId || teacherId;
  let interview = null;

  if (targetId) {
    interview = await Interview.findById(targetId).populate('teacherId');
  }

  if (!interview && targetId) {
    interview = await Interview.findOne({ teacherId: targetId }).sort({ createdAt: -1 }).populate('teacherId');
  }

  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview not found' });
  }

  interview.status = 'scheduled';
  await interview.save();

  const teacher = interview.teacherId;
  if (teacher) {
    teacher.interview = {
      scheduledAt: interview.scheduledAt,
      slotId: interview._id,
      status: 'scheduled',
      notes: interview.teacherNotes || '',
      agoraChannelName: interview.agoraChannelName,
    };
    teacher.applicationStatus = 'interview_scheduled';
    await teacher.save();

    // Send Notification to Teacher
    const formattedDate = new Date(interview.scheduledAt).toLocaleString();
    await Notification.create({
      userId: teacher.userId,
      title: 'Interview Confirmed by Admin',
      message: `Your verification interview has been confirmed for ${formattedDate}. Please check your onboarding dashboard to join.`,
      type: 'interview_scheduled',
    });
  }

  res.json({
    success: true,
    message: 'Interview confirmed successfully and notification sent to teacher.',
    data: interview,
  });
});

