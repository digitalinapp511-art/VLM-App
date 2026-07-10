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
  try {
    const Session = (await import('../models/Session.js')).default;
    const DoubtRequest = (await import('../models/DoubtRequest.js')).default;
    
    const session = await Session.findById(req.params.id)
      .populate('teacherId', 'firstName lastName profilePhoto gender')
      .populate('studentId', 'firstName lastName nickname class profilePhoto');
      
    if (!session) return res.status(404).json({ success: false, message: 'Not found' });
    
    const doubtRequest = await DoubtRequest.findOne({ sessionId: session._id });
    
    let elapsedSeconds = 0;
    if (session.startedAt && !session.endedAt) {
      elapsedSeconds = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    } else if (session.duration) {
      elapsedSeconds = session.duration;
    }
    
    res.json({ 
      success: true, 
      data: {
        ...session.toObject(),
        teacherId: session.teacherId ? {
          ...session.teacherId.toObject(),
          fullName: `${session.teacherId.firstName || ""} ${session.teacherId.lastName || ""}`.trim()
        } : null,
        studentId: session.studentId ? {
          ...session.studentId.toObject(),
          fullName: `${session.studentId.firstName || ""} ${session.studentId.lastName || ""}`.trim()
        } : null,
        doubtRequestId: doubtRequest ? doubtRequest._id.toString() : null,
        elapsedSeconds
      } 
    });
  } catch (err) {
    next(err);
  }
});

export default router;
