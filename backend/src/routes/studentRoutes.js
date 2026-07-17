import { Router } from 'express';
import {
  createStudentProfile, getStudentProfile, getDashboard, getPlans,
  activateTrial, submitDoubt, getDailyMcq, submitMcq, getMcqHistory, getLeaderboard, toggleFavoriteTeacher, getSubjects,
  getChapters, claimSpinReward, getStudentWalletHistory, rechargeWallet, submitDoubtWithImages, getDoubtById,
  getAvailableTeachers, getParentRequests, approveParentRequest, rejectParentRequest,
  getAiChatHistory, submitAiChatQuery, getAiChatSessions, deleteAiChatSession, clearAllAiChatHistory,
  getStudentStats, submitUsageHeartbeat, cancelDoubtRequest, deductSessionCredits, getStudentResources, getActiveBanners,
  getOnboardingSlides
} from '../controllers/studentController.js';
import {
  getSessionHistory, getSessionMessages, sendMessage, resolveSession,
  getNotifications, markNotificationRead, markAllNotificationsRead, createTicket, getTickets, getTicket,
  replyTicket, getLiveClasses, uploadShortVideo, getShortVideos, getMyVideos,
  getReferralData,
} from '../controllers/sharedController.js';
import { generateAgoraToken } from '../controllers/sessionController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload, cloudinaryUploadMiddleware, getFileUrl } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Student from '../models/Student.js';

const router = Router();
router.use(protect, authorize('student'));

router.post('/profile/photo', upload.single('photo'), cloudinaryUploadMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const student = await Student.findOne({ userId: req.user._id });
  const photoUrl = getFileUrl(req.file.filename, 'profiles');
  if (student) {
    student.profilePhoto = photoUrl;
    await student.save();
  }
  res.json({ success: true, url: photoUrl });
}));

router.get('/profile', getStudentProfile);
router.get('/subjects', getSubjects);
router.get('/subjects-with-ids', getSubjects);
router.get('/chapters', getChapters);
router.post('/profile', createStudentProfile);
router.put('/profile', createStudentProfile);
router.get('/dashboard', getDashboard);
router.get('/stats', getStudentStats);
router.get('/ai-chat/history', getAiChatHistory);
router.get('/ai-chat/sessions', getAiChatSessions);
router.delete('/ai-chat/session/:sessionId', deleteAiChatSession);
router.delete('/ai-chat/history', clearAllAiChatHistory);
router.post('/ai-chat', upload.single('image'), cloudinaryUploadMiddleware, submitAiChatQuery);
router.get('/plans', getPlans);
router.post('/trial', activateTrial);
router.post('/spin', claimSpinReward);
router.post('/usage-heartbeat', submitUsageHeartbeat);
router.post('/doubt', submitDoubt);
router.post('/doubts/upload', upload.single('images'), cloudinaryUploadMiddleware, submitDoubtWithImages);
router.get('/doubts/:id', getDoubtById);
router.post('/doubts/:id/cancel', cancelDoubtRequest);
router.get('/teachers', getAvailableTeachers);
router.get('/mcq/daily', getDailyMcq);
router.get('/mcq/history', getMcqHistory);
router.post('/mcq/submit', submitMcq);
router.get('/leaderboard', getLeaderboard);
router.get('/resources', getStudentResources);
router.get('/banners', getActiveBanners);
router.get('/onboarding-slides', getOnboardingSlides);
router.post('/favorite-teacher', toggleFavoriteTeacher);
router.get('/sessions', getSessionHistory);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.post('/sessions/messages', sendMessage);
router.post('/sessions/:sessionId/resolve', resolveSession);
router.post('/sessions/:sessionId/deduct-credits', deductSessionCredits);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.post('/tickets/:id/reply', replyTicket);
router.get('/live-classes', getLiveClasses);
router.post('/videos', upload.single('video'), cloudinaryUploadMiddleware, uploadShortVideo);
router.get('/videos', getShortVideos);
router.get('/videos/mine', getMyVideos);
router.get('/referral', getReferralData);
router.get('/wallet/history', getStudentWalletHistory);
router.post('/wallet/recharge', rechargeWallet);
router.get('/parent-requests', getParentRequests);
router.post('/parent-requests/:parentId/approve', approveParentRequest);
router.post('/parent-requests/:parentId/reject', rejectParentRequest);

// ── Agora token for student session ──────────────────────────────────────
router.get('/sessions/:sessionId/agora-token', generateAgoraToken);

router.post('/chat/upload', upload.single('media'), cloudinaryUploadMiddleware, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const mediaUrl = getFileUrl(req.file.filename, 'chat');
  res.json({ success: true, url: mediaUrl });
});

router.post('/debug-match', asyncHandler(async (req, res) => {
  const { subject, class: cls, language, board } = req.body;
  const { findEligibleTeachers } = await import('../services/matchingService.js');
  
  // Also get the raw DB teachers for comparison
  const Teacher = (await import('../models/Teacher.js')).default;
  const allTeachers = await Teacher.find({}).select('firstName subjects classes languages boards availabilityStatus applicationStatus');
  
  const { getAvailableTeacherIds } = await import('../services/presenceService.js');
  const availableRedisIds = await getAvailableTeacherIds();

  const matchedTeachers = await findEligibleTeachers({
    subject,
    class: cls,
    language,
    board,
    studentId: req.user._id,
  });

  res.json({
    success: true,
    data: {
      input: { subject, class: cls, language, board },
      redisAvailableIds: availableRedisIds,
      matchedTeachers,
      allTeachersInDB: allTeachers,
    }
  });
}));

export default router;
