import { Router } from 'express';
import {
  getTeacherProfile, updateOnboarding, submitApplication, getApplicationStatus,
  updateAvailability, getDashboard, updateProfile, scheduleInterview, getInterviewSlots,
} from '../controllers/teacherController.js';
import {
  getIncomingRequests, respondToRequest, getWallet, requestWithdrawal,
  getWithdrawals, getReviews, replyReview, createLiveClass, getLiveClasses,
  getEarningsHistory, getAnalytics,
} from '../controllers/sharedController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Teacher from '../models/Teacher.js';

const router = Router();
router.use(protect, authorize('teacher'));

router.post('/profile/photo', upload.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const teacher = await Teacher.findOne({ userId: req.user._id });
  const photoUrl = `/uploads/profiles/${req.file.filename}`;
  if (teacher) {
    teacher.profilePhoto = photoUrl;
    await teacher.save();
  }
  res.json({ success: true, url: photoUrl });
}));

router.get('/profile', getTeacherProfile);
router.put('/onboarding', updateOnboarding);
router.post('/onboarding/upload', upload.single('file'), (req, res) => {
  const folder = req.file?.mimetype?.startsWith('video/') ? 'videos' : 'documents';
  res.json({ success: true, url: `/uploads/${folder}/${req.file.filename}` });
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
router.get('/requests', getIncomingRequests);
router.post('/requests/respond', respondToRequest);
router.get('/wallet', getWallet);
router.post('/withdraw', requestWithdrawal);
router.get('/withdrawals', getWithdrawals);
router.get('/earnings', getEarningsHistory);
router.get('/reviews', getReviews);
router.post('/reviews/:id/reply', replyReview);
router.post('/live-classes', createLiveClass);
router.get('/live-classes', getLiveClasses);
router.get('/analytics', getAnalytics);

export default router;
