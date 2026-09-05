import { Router } from 'express';
import {
  createStudentProfile, getStudentProfile, getDashboard, getPlans,
  activateTrial, submitDoubt, getDailyMcq, generateDailyMcq, submitMcq, getMcqHistory, getLeaderboard, toggleFavoriteTeacher, getSubjects,
  getChapters, claimSpinReward, getStudentWalletHistory, rechargeWallet, submitDoubtWithImages, getDoubtById,
  getAvailableTeachers, getParentRequests, approveParentRequest, rejectParentRequest,
  getAiChatHistory, submitAiChatQuery, getAiChatSessions, deleteAiChatSession, clearAllAiChatHistory,
  getStudentStats, submitUsageHeartbeat, cancelDoubtRequest, deductSessionCredits, getStudentResources, getActiveBanners,
  getOnboardingSlides, getStudentSubjects, getStudentSpinSettings, getActiveCashbackOffers
} from '../controllers/studentController.js';
import {
  createWalletOrder, verifyWalletPayment,
  createSubscriptionOrder, verifySubscriptionPayment, logPaymentFailure,
  getSubscriptionStatus, cancelSubscription,
} from '../controllers/paymentController.js';
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
import {
  toggleLikeShortVideo, incrementShortVideoView, incrementShortVideoShare,
  addShortVideoComment, deleteShortVideoComment, getShortVideoComments,
  getPublicProfile, editPublicProfile, toggleFollowUser,
  checkUsernameAvailability, createPublicProfileUsername
} from '../controllers/socialController.js';
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
router.get('/spin-settings', getStudentSpinSettings);
router.post('/usage-heartbeat', submitUsageHeartbeat);
router.post('/doubt', submitDoubt);
router.post('/doubts/upload', upload.single('images'), cloudinaryUploadMiddleware, submitDoubtWithImages);
router.get('/doubts/:id', getDoubtById);
router.post('/doubts/:id/cancel', cancelDoubtRequest);
router.get('/teachers', getAvailableTeachers);
router.get('/mcq/daily', getDailyMcq);
router.post('/mcq/generate', generateDailyMcq);
router.get('/mcq/history', getMcqHistory);
router.post('/mcq/submit', submitMcq);
router.get('/leaderboard', getLeaderboard);
router.get('/resources', getStudentResources);
router.get('/resources/subjects', getStudentSubjects);
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
router.post('/videos/:id/like', toggleLikeShortVideo);
router.post('/videos/:id/view', incrementShortVideoView);
router.post('/videos/:id/share', incrementShortVideoShare);
router.post('/videos/:id/comment', addShortVideoComment);
router.delete('/videos/:id/comment/:commentId', deleteShortVideoComment);
router.get('/videos/:id/comments', getShortVideoComments);
router.get('/social/profile/:id', getPublicProfile);
router.put('/social/profile', editPublicProfile);
router.post('/social/profile/photo', upload.single('photo'), cloudinaryUploadMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const photoUrl = getFileUrl(req.file.filename, 'profiles');
  const student = await Student.findOne({ userId: req.user._id });
  if (student) {
    student.publicProfilePhoto = photoUrl;
    await student.save();
  }
  res.json({ success: true, url: photoUrl });
}));
router.post('/social/profile/:id/follow', toggleFollowUser);
router.get('/social/username/check', checkUsernameAvailability);
router.post('/social/username', createPublicProfileUsername);
router.get('/referral', getReferralData);
router.get('/wallet/history', getStudentWalletHistory);
router.post('/wallet/recharge', rechargeWallet); // legacy / admin use only
router.get('/wallet/cashback-offers', getActiveCashbackOffers);

// ── Razorpay Payment Routes ──────────────────────────────────────────────────
router.post('/payment/wallet/create-order', createWalletOrder);
router.post('/payment/wallet/verify', verifyWalletPayment);
router.post('/payment/subscription/create-order', createSubscriptionOrder);
router.post('/payment/subscription/verify', verifySubscriptionPayment);
router.post('/payment/subscription/log-failure', logPaymentFailure);
router.get('/payment/subscription/status', getSubscriptionStatus);
router.post('/payment/subscription/cancel', cancelSubscription);
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

// ── Device Token (FCM) ────────────────────────────────────────────────────────

/**
 * POST /api/student/device-token
 * Register or update the FCM device token for the logged-in user.
 * The APK should call this on login / token refresh.
 */
router.post('/device-token', asyncHandler(async (req, res) => {
  const { token, platform = 'android' } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'token is required' });

  const User = (await import('../models/User.js')).default;

  // Add token only if not already present (prevent duplicates)
  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { deviceTokens: token } }
  );

  res.json({ success: true, message: 'Device token registered' });
}));

/**
 * DELETE /api/student/device-token
 * Remove the FCM token on logout so the user stops receiving push notifications.
 */
router.delete('/device-token', asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ success: false, message: 'token is required' });

  const User = (await import('../models/User.js')).default;

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { deviceTokens: token } }
  );

  res.json({ success: true, message: 'Device token removed' });
}));

export default router;

