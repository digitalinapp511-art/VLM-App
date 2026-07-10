import { Router } from 'express';
import cookieParser from 'cookie-parser';
import {
  sendOtp, verifyOtp, loginWithEmail, registerWithEmail,
  getMe, switchRole, logout, checkAppStatus, verifyProfileContact,
  refreshTokens,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Parse cookies on all auth routes (needed for vlm_refresh cookie)
router.use(cookieParser());

router.get('/app-status', checkAppStatus);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login', loginWithEmail);
router.post('/register', registerWithEmail);
router.post('/refresh', refreshTokens);       // silent token refresh — no protect needed
router.get('/me', protect, getMe);
router.post('/switch-role', protect, switchRole);
router.post('/logout', protect, logout);
router.post('/verify-profile-contact', protect, verifyProfileContact);

export default router;
