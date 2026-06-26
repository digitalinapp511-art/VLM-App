import { Router } from 'express';
import {
  createStudentProfile, getStudentProfile, getDashboard, getPlans,
  activateTrial, submitDoubt, getDailyMcq, submitMcq, toggleFavoriteTeacher, getSubjects,
  getChapters, claimSpinReward
} from '../controllers/studentController.js';
import {
  getSessionHistory, getSessionMessages, sendMessage, resolveSession,
  getNotifications, markNotificationRead, createTicket, getTickets, getTicket,
  replyTicket, getLiveClasses, uploadShortVideo, getShortVideos, getMyVideos,
  getReferralData,
} from '../controllers/sharedController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = Router();
router.use(protect, authorize('student'));

router.get('/profile', getStudentProfile);
router.get('/subjects', getSubjects);
router.get('/subjects-with-ids', getSubjects);
router.get('/chapters', getChapters);
router.post('/profile', createStudentProfile);
router.put('/profile', createStudentProfile);
router.get('/dashboard', getDashboard);
router.get('/plans', getPlans);
router.post('/trial', activateTrial);
router.post('/spin', claimSpinReward);
router.post('/doubt', submitDoubt);
router.get('/mcq/daily', getDailyMcq);
router.post('/mcq/submit', submitMcq);
router.post('/favorite-teacher', toggleFavoriteTeacher);
router.get('/sessions', getSessionHistory);
router.get('/sessions/:sessionId/messages', getSessionMessages);
router.post('/sessions/messages', sendMessage);
router.post('/sessions/resolve', resolveSession);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.post('/tickets/:id/reply', replyTicket);
router.get('/live-classes', getLiveClasses);
router.post('/videos', upload.single('video'), uploadShortVideo);
router.get('/videos', getShortVideos);
router.get('/videos/mine', getMyVideos);
router.get('/referral', getReferralData);

export default router;
