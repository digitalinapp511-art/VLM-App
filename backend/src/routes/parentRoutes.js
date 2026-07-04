import { Router } from 'express';
import {
  createParentProfile, getParentProfile, linkChild, getDashboard, updateControls,
} from '../controllers/parentController.js';
import {
  getNotifications, markNotificationRead, createTicket, getTickets, getTicket,
  replyTicket, getSessionHistory,
} from '../controllers/sharedController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload, cloudinaryUploadMiddleware, getFileUrl } from '../middleware/upload.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Parent from '../models/Parent.js';

const router = Router();
router.use(protect, authorize('parent'));

router.post('/profile/photo', upload.single('photo'), cloudinaryUploadMiddleware, asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const parent = await Parent.findOne({ userId: req.user._id });
  const photoUrl = getFileUrl(req.file.filename, 'profiles');
  if (parent) {
    parent.profilePhoto = photoUrl;
    await parent.save();
  }
  res.json({ success: true, url: photoUrl });
}));

router.get('/profile', getParentProfile);
router.post('/profile', createParentProfile);
router.put('/profile', createParentProfile);
router.post('/link-child', linkChild);
router.get('/dashboard', getDashboard);
router.put('/controls', updateControls);
router.get('/sessions', getSessionHistory);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.post('/tickets', createTicket);
router.get('/tickets', getTickets);
router.get('/tickets/:id', getTicket);
router.post('/tickets/:id/reply', replyTicket);

export default router;
