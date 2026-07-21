import { Router } from 'express';
import {
  getTeacherProfile, updateOnboarding, submitApplication, getApplicationStatus,
  updateAvailability, getDashboard, updateProfile, scheduleInterview, getInterviewSlots,
} from '../controllers/teacherController.js';
import {
  getWallet, requestWithdrawal,
  getWithdrawals, getReviews, replyReview, createLiveClass, getLiveClasses,
  getEarningsHistory, getAnalytics, uploadShortVideo, getShortVideos,
} from '../controllers/sharedController.js';

router.post('/videos', upload.single('video'), cloudinaryUploadMiddleware, uploadShortVideo);
router.get('/videos', getShortVideos);
import {
  generateAgoraToken, acceptDoubtRequest, declineDoubtRequest,
  getIncomingRequests, endSession,
} from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload, cloudinaryUploadMiddleware, getFileUrl } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Teacher from '../models/Teacher.js';
import Notification from '../models/Notification.js';
import Session from '../models/Session.js';
import {
  uploadVerificationDocs,
  scheduleInterview as scheduleTeacherVerificationInterview,
  getInterviewAgoraToken,
  handleClassUpgradeRequest,
  getMyVerificationStatus,
  getAvailableInterviewSlots,
} from '../controllers/teacherVerificationController.js';

const router = Router();
router.use(protect, authorize('teacher'));

// Teacher verification & onboarding routes
router.get('/verification/my-status', getMyVerificationStatus);
router.get('/verification/available-slots', getAvailableInterviewSlots);
router.post('/verification/documents', uploadVerificationDocs);
router.post('/verification/schedule-interview', scheduleTeacherVerificationInterview);
router.post('/verification/agora-token', getInterviewAgoraToken);
router.post('/verification/class-upgrade', handleClassUpgradeRequest);

router.post('/profile/photo', upload.single('photo'), cloudinaryUploadMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const photoUrl = getFileUrl(req.file.filename, 'profiles');
  if (teacher) {
    teacher.profilePhoto = photoUrl;
    await teacher.save();
  }
  res.json({ success: true, url: photoUrl });
}));

router.get('/profile', getTeacherProfile);
router.put('/profile', updateOnboarding);
router.patch('/profile', updateOnboarding);
router.put('/onboarding', updateOnboarding);

router.post('/onboarding/upload', upload.single('file'), cloudinaryUploadMiddleware, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const folder = req.file?.mimetype?.startsWith('video/') ? 'videos' : 'documents';
  const url = getFileUrl(req.file.filename, folder);
  res.json({ success: true, url });
});

router.post('/documents', upload.single('document'), cloudinaryUploadMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const folder = req.file?.mimetype?.startsWith('video/') ? 'videos' : 'documents';
  const url = getFileUrl(req.file.filename, folder);

  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (teacher) {
    const Document = (await import('../models/Document.js')).default;
    const documentName = req.body.name || req.file.originalname || req.file.filename;
    const documentType = req.body.type || 'additional';

    await Document.create({
      userId: req.user._id,
      teacherId: teacher._id,
      type: documentType,
      name: documentName,
      url: url,
      status: 'pending'
    });
  }

  res.json({ success: true, url });
}));

router.post('/demo-video', upload.single('video'), cloudinaryUploadMiddleware, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const url = getFileUrl(req.file.filename, 'videos');
  res.json({ success: true, url });
});

router.post('/submit', submitApplication);
router.get('/application-status', getApplicationStatus);
router.put('/availability', updateAvailability);
router.patch('/availability', updateAvailability);
router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);
router.patch('/profile', updateProfile);
router.get('/interview/slots', getInterviewSlots);
router.post('/interview/schedule', scheduleInterview);

// ── Session / Doubt Request Management ────────────────────────────────────
router.get('/incoming-requests', getIncomingRequests);
router.post('/sessions/:requestId/accept', acceptDoubtRequest);
router.post('/sessions/:requestId/decline', declineDoubtRequest);
router.post('/sessions/:sessionId/end', endSession);
router.get('/sessions/:sessionId/agora-token', generateAgoraToken);

// ── Session history for teacher ────────────────────────────────────────────
router.get('/sessions', asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Not found' });
  const sessions = await Session.find({ teacherId: teacher._id })
    .populate('studentId', 'fullName class nickname profilePhoto')
    .sort({ createdAt: -1 })
    .limit(50);
  res.json({ success: true, sessions });
}));

router.get('/wallet', getWallet);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.get('/earnings', getEarningsHistory);
router.get('/reviews', getReviews);
router.post('/reviews/:id/reply', replyReview);
router.post('/live-classes', createLiveClass);
router.get('/live-classes', getLiveClasses);
router.get('/analytics', getAnalytics);

// ── Notifications ────────────────────────────────────────────────────────
router.get('/notifications', asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, notifications });
}));

router.patch('/notifications/:id/read', asyncHandler(async (req, res) => {
  await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
  res.json({ success: true });
}));

router.post('/chat/upload', upload.single('media'), cloudinaryUploadMiddleware, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const mediaUrl = getFileUrl(req.file.filename, 'chat');
  res.json({ success: true, url: mediaUrl });
});

// ── Debug: inspect this teacher's current Redis + DB state ───────────────────
// GET /api/teacher/debug-state
router.get('/debug-state', asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ userId: req.user._id });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  const { getTeacherState, getAvailableTeacherIds, hasDispatchLock } = await import('../services/presenceService.js');

  const [redisState, availableIds, isLocked] = await Promise.all([
    getTeacherState(teacher._id),
    getAvailableTeacherIds(),
    hasDispatchLock(teacher._id),
  ]);

  const isInAvailableSet = availableIds.includes(teacher._id.toString());

  res.json({
    success: true,
    debug: {
      teacherId: teacher._id,
      userId: teacher.userId,
      firstName: teacher.firstName,
      applicationStatus: teacher.applicationStatus,
      availabilityStatus: teacher.availabilityStatus,
      subjects: teacher.subjects,
      classes: teacher.classes,
      boards: teacher.boards,
      languages: teacher.languages,
      redis: {
        state: redisState,
        isInAvailableSet,
        isLocked,
        totalOnlineCount: availableIds.length,
        allOnlineIds: availableIds,
      },
    },
  });
}));

export default router;
