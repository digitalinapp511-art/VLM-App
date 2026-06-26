import { Router } from 'express';
import {
  sendOtp, verifyOtp, loginWithEmail, registerWithEmail,
  getMe, switchRole, logout, checkAppStatus,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/app-status', checkAppStatus);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginWithEmail);
router.post('/register', registerWithEmail);
router.get('/me', protect, getMe);
router.post('/switch-role', protect, switchRole);
router.post('/logout', protect, logout);

export default router;
