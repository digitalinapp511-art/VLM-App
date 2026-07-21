import Teacher from '../models/Teacher.js';
import Document from '../models/Document.js';
import Interview from '../models/Interview.js';
import PayoutRecord from '../models/PayoutRecord.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateRtcToken } from '../services/agoraService.js';

/**
 * @route POST /api/teacher/verification/documents
 * @desc Upload onboarding documents & bank details
 */
export const uploadVerificationDocs = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  }

  const { documents, bankDetails, demoVideoUrl } = req.body;

  if (bankDetails) {
    teacher.bankDetails = {
      accountHolder: bankDetails.accountHolder,
      accountNumber: bankDetails.accountNumber,
      ifsc: bankDetails.ifsc,
      bankName: bankDetails.bankName,
      upiId: bankDetails.upiId,
      isVerified: false,
    };
  }

  if (demoVideoUrl) {
    teacher.demoVideo = {
      url: demoVideoUrl,
      status: 'pending',
    };
  }

  if (documents && Array.isArray(documents)) {
    for (const doc of documents) {
      await Document.findOneAndUpdate(
        { teacherId: teacher._id, type: doc.type },
        {
          userId: req.user._id,
          teacherId: teacher._id,
          type: doc.type,
          name: doc.name || doc.type,
          url: doc.url,
          status: 'pending',
        },
        { upsert: true, new: true }
      );
    }
  }

  teacher.documentsSubmitted = true;
  if (teacher.applicationStatus === 'draft') {
    teacher.applicationStatus = 'pending_interview';
  }
  await teacher.save();

  res.json({
    success: true,
    message: 'Verification documents and bank details saved successfully',
    data: teacher,
  });
});

/**
 * @route GET /api/teacher/verification/available-slots
 * @desc Get admin configured available days and time slots for interview booking
 */
export const getAvailableInterviewSlots = asyncHandler(async (req, res) => {
  const AdminSettings = (await import('../models/AdminSettings.js')).default;
  let settings = await AdminSettings.findOne({ key: 'interview_slot_config' });

  if (!settings) {
    settings = {
      value: {
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        timeSlots: ['09:00 AM', '10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'],
        maxBookingsPerSlot: 3,
      },
    };
  }

  res.json({
    success: true,
    data: settings.value,
  });
});

/**
 * @route POST /api/teacher/verification/schedule-interview
 * @desc Teacher schedules an interview for verification
 */
export const scheduleInterview = asyncHandler(async (req, res) => {
  const { scheduledAt, teacherNotes, type = 'onboarding', upgradeClasses } = req.body;
  const teacher = await Teacher.findOne({ userId: req.user._id });

  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  }

  const agoraChannelName = `interview_${teacher._id}_${Date.now()}`;

  const interview = await Interview.create({
    teacherId: teacher._id,
    scheduledAt: new Date(scheduledAt),
    slotRequestedBy: 'teacher',
    teacherNotes,
    agoraChannelName,
    status: 'scheduled',
    type,
    upgradeClasses: upgradeClasses || [],
  });

  teacher.interview = {
    scheduledAt: interview.scheduledAt,
    slotId: interview._id,
    status: 'scheduled',
    notes: teacherNotes,
    agoraChannelName,
  };

  if (type === 'class_upgrade') {
    teacher.pendingClassUpgrade = {
      requestedClasses: upgradeClasses,
      status: 'pending_interview',
      requestedAt: new Date(),
    };
  } else {
    teacher.applicationStatus = 'pending_interview';
  }

  await teacher.save();

  res.json({
    success: true,
    message: 'Interview scheduled successfully',
    data: interview,
  });
});

/**
 * @route POST /api/teacher/verification/agora-token
 * @desc Get Agora RTC token for verification interview room
 */
export const getInterviewAgoraToken = asyncHandler(async (req, res) => {
  const { interviewId } = req.body;
  const interview = await Interview.findById(interviewId).populate('teacherId');

  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview not found' });
  }

  const channelName = interview.agoraChannelName || `interview_${interview.teacherId._id}`;
  const uid = req.user._id.toString();

  // Generate Agora RTC Token (or return channel name if RTC token generator helper fallback)
  let agoraToken = '';
  try {
    agoraToken = generateRtcToken(channelName, uid);
  } catch (err) {
    console.warn('Agora token generation warning:', err.message);
  }

  res.json({
    success: true,
    data: {
      channelName,
      agoraToken,
      appId: process.env.AGORA_APP_ID || '',
      uid,
    },
  });
});

/**
 * @route POST /api/teacher/verification/class-upgrade
 * @desc Manage class additions / upgrades (Auto-approve lower classes vs Require Interview for higher classes)
 */
export const handleClassUpgradeRequest = asyncHandler(async (req, res) => {
  const { requestedClasses } = req.body; // e.g. ['6', '7', '11', '12']
  const teacher = await Teacher.findOne({ userId: req.user._id });

  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  }

  if (!teacher.isApproved || teacher.applicationStatus !== 'approved') {
    return res.status(400).json({
      success: false,
      message: 'You must be a verified teacher before updating or adding teaching classes.',
    });
  }

  const verifiedClasses = (teacher.verifiedClasses || []).map(c => parseInt(c, 10)).filter(n => !isNaN(n));
  const maxVerifiedClass = verifiedClasses.length > 0 ? Math.max(...verifiedClasses) : 10;

  const requestedNums = requestedClasses.map(c => parseInt(c, 10)).filter(n => !isNaN(n));
  const requiresInterview = requestedNums.some(n => n > maxVerifiedClass);

  if (!requiresInterview) {
    // All requested classes are lower or equal to max verified class -> Auto Approve!
    const newClasses = Array.from(new Set([...(teacher.classes || []), ...requestedClasses]));
    const newVerifiedClasses = Array.from(new Set([...(teacher.verifiedClasses || []), ...requestedClasses]));

    teacher.classes = newClasses;
    teacher.verifiedClasses = newVerifiedClasses;
    await teacher.save();

    return res.json({
      success: true,
      autoApproved: true,
      message: 'Class list updated successfully without needing an interview.',
      data: teacher,
    });
  }

  // Higher classes requested -> Requires Interview!
  teacher.pendingClassUpgrade = {
    requestedClasses,
    status: 'pending_interview',
    requestedAt: new Date(),
  };
  await teacher.save();

  res.json({
    success: true,
    autoApproved: false,
    requiresInterview: true,
    message: 'Adding higher grade levels requires a verification interview. Please schedule an interview.',
    data: {
      requestedClasses,
      maxVerifiedClass,
    },
  });
});

/**
 * @route GET /api/teacher/verification/my-status
 * @desc Get detailed status of onboarding, interview, and class upgrades
 */
export const getMyVerificationStatus = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher profile not found' });
  }

  const docs = await Document.find({ teacherId: teacher._id });
  const latestInterview = await Interview.findOne({ teacherId: teacher._id }).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      applicationStatus: teacher.applicationStatus,
      isApproved: teacher.isApproved,
      availabilityStatus: teacher.availabilityStatus,
      documentsSubmitted: teacher.documentsSubmitted,
      verifiedClasses: teacher.verifiedClasses || [],
      pendingClassUpgrade: teacher.pendingClassUpgrade,
      bankDetails: teacher.bankDetails,
      documents: docs,
      interview: latestInterview,
    },
  });
});
