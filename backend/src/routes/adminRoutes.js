import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminDashboardStats,
  getSpinSettings,
  updateSpinSettings
} from '../controllers/adminController.js';

const router = express.Router();

// Protect all admin routes - only users authenticated as 'admin' can access
// In development, you can temporarily comment out the authorize('admin') line for testing if needed
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/spin-settings', getSpinSettings);
router.post('/spin-settings', updateSpinSettings);

export default router;
