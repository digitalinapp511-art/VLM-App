import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';
import User from '../models/User.js';
import DoubtRequest from '../models/DoubtRequest.js';
import AdminSettings from '../models/AdminSettings.js';
import StudyResource from '../models/StudyResource.js';
import WalletTransaction from '../models/WalletTransaction.js';
import Withdrawal from '../models/Withdrawal.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { generateToken } from '../middleware/auth.js';

/**
 * Get Admin Dashboard Stats
 * GET /api/admin/dashboard
 */
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const activeStudents = await User.countDocuments({ role: 'student', status: 'active' });
  const totalTeachers = await Teacher.countDocuments();
  const activeTeachers = await User.countDocuments({ role: 'teacher', status: 'active' });
  const totalParents = await Parent.countDocuments();
  
  // Doubt requests currently in 'searching' state (waiting for a teacher to accept)
  const pendingDoubts = await DoubtRequest.countDocuments({ status: 'searching' });
  
  // Teachers who are submitted but not yet fully approved or rejected
  const pendingTeacherApprovals = await Teacher.countDocuments({
    applicationStatus: { $in: ['submitted', 'under_review', 'interview_scheduled', 'interview_pending'] }
  });

  res.json({
    success: true,
    data: {
      totalStudents,
      activeStudents,
      totalTeachers,
      activeTeachers,
      totalParents,
      pendingDoubts,
      pendingTeacherApprovals
    }
  });
});

/**
 * Get Spin Rewards Settings
 * GET /api/admin/spin-settings
 */
export const getSpinSettings = asyncHandler(async (req, res) => {
  let settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  
  // Provide default settings if they don't exist yet
  if (!settings) {
    settings = await AdminSettings.create({
      key: 'spin_rewards',
      category: 'spin',
      description: 'Rewards configuration for student spin wheel',
      value: [
        { id: 1, name: '10 Coins', probability: 30, color: '#f59e0b', type: 'coins', amount: 10 },
        { id: 2, name: 'Free Chat Session', probability: 20, color: '#3b82f6', type: 'chat_credit', amount: 1 },
        { id: 3, name: 'Better luck next time', probability: 40, color: '#0f172a', type: 'none', amount: 0 },
        { id: 4, name: '50 Coins', probability: 10, color: '#ef4444', type: 'coins', amount: 50 }
      ]
    });
  }

  res.json({
    success: true,
    data: settings.value
  });
});

/**
 * Update Spin Rewards Settings
 * POST /api/admin/spin-settings
 */
export const updateSpinSettings = asyncHandler(async (req, res) => {
  const { rewards } = req.body;
  if (!rewards || !Array.isArray(rewards)) {
    return res.status(400).json({ success: false, message: 'Rewards must be an array' });
  }

  let settings = await AdminSettings.findOne({ key: 'spin_rewards' });
  if (!settings) {
    settings = new AdminSettings({
      key: 'spin_rewards',
      category: 'spin',
      description: 'Rewards configuration for student spin wheel'
    });
  }

  settings.value = rewards;
  await settings.save();

  res.json({
    success: true,
    message: 'Spin settings updated successfully',
    data: settings.value
  });
});

/**
 * Admin Login
 * POST /api/admin/login
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  // Find user by email
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.roles.includes('admin')) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      roles: user.roles
    }
  });
});

/**
 * List all students
 * GET /api/admin/students
 */
export const getStudents = asyncHandler(async (req, res) => {
  const students = await Student.find().populate('userId', 'status lastLogin');
  res.json({
    success: true,
    data: students
  });
});

/**
 * List all teachers
 * GET /api/admin/teachers
 */
export const getTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find().populate('userId', 'status lastLogin');
  res.json({
    success: true,
    data: teachers
  });
});

/**
 * List all parents
 * GET /api/admin/parents
 */
export const getParents = asyncHandler(async (req, res) => {
  const parents = await Parent.find().populate('userId', 'status lastLogin');
  res.json({
    success: true,
    data: parents
  });
});

/**
 * Approve pending teacher
 * POST /api/admin/teachers/:id/approve
 */
export const approveTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }

  teacher.applicationStatus = 'approved';
  await teacher.save();

  res.json({
    success: true,
    message: 'Teacher application approved successfully',
    data: teacher
  });
});

/**
 * Reject pending teacher
 * POST /api/admin/teachers/:id/reject
 */
export const rejectTeacher = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }

  teacher.applicationStatus = 'rejected';
  teacher.rejectionReason = reason || 'Does not satisfy qualification requirements';
  await teacher.save();

  res.json({
    success: true,
    message: 'Teacher application rejected successfully',
    data: teacher
  });
});

/**
 * Edit Student Profile
 * PUT /api/admin/students/:id
 */
export const editStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }
  res.json({ success: true, message: 'Student profile updated', data: student });
});

/**
 * Edit Teacher Profile
 * PUT /api/admin/teachers/:id
 */
export const editTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!teacher) {
    return res.status(404).json({ success: false, message: 'Teacher not found' });
  }
  res.json({ success: true, message: 'Teacher profile updated', data: teacher });
});

/**
 * Get Financial Overview
 * GET /api/admin/financials
 */
export const getAdminFinancials = asyncHandler(async (req, res) => {
  // 1. Total money paid by students (recharge/subscriptions)
  const studentTx = await WalletTransaction.find({ role: 'student', type: 'credit', inrAmount: { $gt: 0 } });
  const totalPaidByStudents = studentTx.reduce((sum, tx) => sum + (tx.inrAmount || 0), 0);

  // 2. App share (25%) and Teacher share (75%)
  const appCommissionShare = totalPaidByStudents * 0.25;
  const teacherTotalShare = totalPaidByStudents * 0.75;

  // 3. Withdrawals stats
  const withdrawals = await Withdrawal.find();
  const completedWithdrawals = withdrawals
    .filter(w => w.status === 'approved' || w.status === 'completed')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  const pendingWithdrawals = withdrawals
    .filter(w => w.status === 'pending')
    .reduce((sum, w) => sum + (w.amount || 0), 0);

  res.json({
    success: true,
    data: {
      totalRevenue: totalPaidByStudents,
      appEarningsCommission: appCommissionShare,
      teachersEarningsPotential: teacherTotalShare,
      teachersWithdrawnEarnings: completedWithdrawals,
      teachersPendingPayouts: pendingWithdrawals,
      commissionPercentage: 25,
      teacherSharePercentage: 75
    }
  });
});

/**
 * Get list of withdrawal requests
 * GET /api/admin/withdrawals
 */
export const getWithdrawals = asyncHandler(async (req, res) => {
  const withdrawals = await Withdrawal.find().populate('teacherId', 'fullName vlmTeacherId email mobile');
  res.json({
    success: true,
    data: withdrawals
  });
});

/**
 * Approve withdrawal request
 * POST /api/admin/withdrawals/:id/approve
 */
export const approveWithdrawal = asyncHandler(async (req, res) => {
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) {
    return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
  }

  if (withdrawal.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Withdrawal request is already processed' });
  }

  withdrawal.status = 'approved';
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  res.json({
    success: true,
    message: 'Withdrawal approved and completed successfully',
    data: withdrawal
  });
});

/**
 * Reject withdrawal request
 * POST /api/admin/withdrawals/:id/reject
 */
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const withdrawal = await Withdrawal.findById(req.params.id);
  if (!withdrawal) {
    return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
  }

  if (withdrawal.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Withdrawal request is already processed' });
  }

  withdrawal.status = 'rejected';
  withdrawal.rejectionReason = reason || 'Bank details verification failed';
  withdrawal.processedAt = new Date();
  await withdrawal.save();

  res.json({
    success: true,
    message: 'Withdrawal request rejected successfully',
    data: withdrawal
  });
});

/**
 * List all study resources (Notes/PYQs)
 * GET /api/admin/resources
 */
export const getStudyResources = asyncHandler(async (req, res) => {
  const { type, className, subject } = req.query;
  const filter = {};
  if (type) filter.type = type;
  if (className) filter.className = className;
  if (subject) filter.subject = subject;

  const resources = await StudyResource.find(filter);
  res.json({
    success: true,
    data: resources
  });
});

/**
 * Add study resource (Class & Chapter-wise note or pyq)
 * POST /api/admin/resources
 */
export const createStudyResource = asyncHandler(async (req, res) => {
  const { title, type, className, subject, chapterName, fileUrl } = req.body;
  if (!title || !type || !className || !subject || !chapterName || !fileUrl) {
    return res.status(400).json({ success: false, message: 'Please provide all resource details' });
  }

  const resource = await StudyResource.create({
    title,
    type,
    className,
    subject,
    chapterName,
    fileUrl,
    uploadedBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'Study resource added successfully',
    data: resource
  });
});

/**
 * Delete study resource
 * DELETE /api/admin/resources/:id
 */
export const deleteStudyResource = asyncHandler(async (req, res) => {
  const resource = await StudyResource.findByIdAndDelete(req.params.id);
  if (!resource) {
    return res.status(404).json({ success: false, message: 'Resource not found' });
  }
  res.json({
    success: true,
    message: 'Resource deleted successfully'
  });
});
