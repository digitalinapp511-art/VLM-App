import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getAdminDashboardStats,
  getSpinSettings,
  updateSpinSettings,
  adminLogin,
  getStudents,
  getTeachers,
  getParents,
  approveTeacher,
  rejectTeacher,
  editStudent,
  editTeacher,
  getAdminFinancials,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getStudyResources,
  createStudyResource,
  deleteStudyResource
} from '../controllers/adminController.js';

const router = express.Router();

// Public routes
router.post('/login', adminLogin);

// Protect all admin routes below - only users authenticated as 'admin' can access
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboardStats);
router.get('/spin-settings', getSpinSettings);
router.post('/spin-settings', updateSpinSettings);

router.get('/students', getStudents);
router.put('/students/:id', editStudent);
router.get('/teachers', getTeachers);
router.put('/teachers/:id', editTeacher);
router.get('/parents', getParents);

router.post('/teachers/:id/approve', approveTeacher);
router.post('/teachers/:id/reject', rejectTeacher);

router.get('/financials', getAdminFinancials);
router.get('/withdrawals', getWithdrawals);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

router.get('/resources', getStudyResources);
router.post('/resources', createStudyResource);
router.delete('/resources/:id', deleteStudyResource);

export default router;
