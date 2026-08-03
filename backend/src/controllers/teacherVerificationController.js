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
    if (!teacher.documents) {
      teacher.documents = {};
    }
    const updateDoc = {};
    const additionals = [];

    for (const doc of documents) {
      if (doc.type === 'additional') {
        additionals.push({
          name: doc.name || 'additional',
          url: doc.url,
          status: 'pending'
        });
      } else {
        updateDoc[doc.type] = {
          name: doc.name || doc.type,
          url: doc.url,
          status: 'pending',
        };
      }

      if (doc.type === 'additional') {
        if (!Array.isArray(teacher.documents.additional)) {
          teacher.documents.additional = teacher.documents.additional ? [teacher.documents.additional] : [];
        }
        if (!teacher.documents.additional.includes(doc.url)) {
          teacher.documents.additional.push(doc.url);
        }
      } else {
        teacher.documents[doc.type] = doc.url;
      }

      if (doc.type === 'resume') {
        if (!teacher.experience) {
          teacher.experience = {};
        }
        teacher.experience.resumeUrl = doc.url;
      }
    }

    const setPayload = { ...updateDoc };
    if (additionals.length > 0) {
      setPayload.additional = additionals;
    }

    await Document.findOneAndUpdate(
      { teacherId: teacher._id },
      {
        $set: setPayload,
        userId: req.user._id,
        teacherId: teacher._id
      },
      { upsert: true, new: true }
    );

    teacher.markModified('documents');
    teacher.markModified('experience');
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
    status: 'pending',
    type,
    upgradeClasses: upgradeClasses || [],
  });

  teacher.interview = {
    scheduledAt: interview.scheduledAt,
    slotId: interview._id,
    status: 'pending',
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
    teacher.applicationStatus = 'interview_pending';
  }

  await teacher.save();

  res.json({
    success: true,
    message: 'Interview request submitted. Awaiting admin confirmation.',
    data: interview,
  });
});

/**
 * @route POST /api/teacher/verification/agora-token
 * @desc Get Agora RTC token for verification interview room
 */
export const getInterviewAgoraToken = asyncHandler(async (req, res) => {
  const { interviewId, teacherId } = req.body;
  let targetId = interviewId || teacherId;
  let interview = null;

  if (targetId) {
    interview = await Interview.findById(targetId).populate('teacherId');
  }

  if (!interview && targetId) {
    interview = await Interview.findOne({ teacherId: targetId }).sort({ createdAt: -1 }).populate('teacherId');
  }

  if (!interview && targetId) {
    const teacherDoc = await Teacher.findOne({ $or: [{ _id: targetId }, { userId: targetId }] });
    if (teacherDoc) {
      const agoraChannelName = `interview_${teacherDoc._id}_${Date.now()}`;
      interview = await Interview.create({
        teacherId: teacherDoc._id,
        scheduledAt: teacherDoc.interview?.scheduledAt || new Date(),
        slotRequestedBy: 'admin',
        agoraChannelName,
        status: 'scheduled',
        type: 'onboarding'
      });
      interview = await Interview.findById(interview._id).populate('teacherId');

      teacherDoc.interview = {
        scheduledAt: interview.scheduledAt,
        slotId: interview._id,
        status: 'scheduled',
        agoraChannelName
      };
      teacherDoc.applicationStatus = 'interview_scheduled';
      await teacherDoc.save();
    }
  }

  if (!interview) {
    return res.status(404).json({ success: false, message: 'Interview session not found for this teacher.' });
  }

  const teacherObj = interview.teacherId || {};
  const channelName = interview.agoraChannelName || `interview_${teacherObj._id || interview._id}`;
  const uid = req.user?._id ? req.user._id.toString() : 'admin_caller';

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

  const docRecord = await Document.findOne({ teacherId: teacher._id });
  const docs = [];
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
