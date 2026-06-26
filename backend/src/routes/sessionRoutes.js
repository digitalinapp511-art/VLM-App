import {
  getSessionMessages, sendMessage, completeSession, getSessionHistory,
} from '../controllers/sharedController.js';
import { protect } from '../middleware/auth.js';
import { Router } from 'express';

const router = Router();
router.use(protect);

router.get('/:sessionId/messages', getSessionMessages);
router.post('/messages', sendMessage);
router.post('/complete', completeSession);
router.get('/', getSessionHistory);
router.get('/:id', async (req, res, next) => {
  const Session = (await import('../models/Session.js')).default;
  const session = await Session.findById(req.params.id)
    .populate('teacherId', 'fullName profilePhoto')
    .populate('studentId', 'fullName nickname class');
  if (!session) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, data: session });
});

export default router;
