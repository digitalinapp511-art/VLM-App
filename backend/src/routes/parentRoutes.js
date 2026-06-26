import { Router } from 'express';
import {
  createParentProfile, getParentProfile, linkChild, getDashboard, updateControls,
} from '../controllers/parentController.js';
import {
  getNotifications, markNotificationRead, createTicket, getTickets, getTicket,
  replyTicket, getSessionHistory,
} from '../controllers/sharedController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();
router.use(protect, authorize('parent'));

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
