import Teacher from '../../models/Teacher.js';
import User from '../../models/User.js';
import Session from '../../models/Session.js';
import Withdrawal from '../../models/Withdrawal.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import TeacherAvailability from '../../models/TeacherAvailability.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/teachers
// ─────────────────────────────────────────────────────────────────────────────
export const getTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, applicationStatus, subject, search } = req.query;
  const skip = (page - 1) * limit;
  const filter = {};

  if (applicationStatus) filter.applicationStatus = applicationStatus;
  if (subject) filter.subjects = subject;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { vlmTeacherId: { $regex: search, $options: 'i' } },
    ];
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .populate('userId', 'email mobile status lastLogin')
      .skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Teacher.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: teachers,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/teachers/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('userId', 'email mobile status lastLogin');
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  res.json({ success: true, data: teacher });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/teachers
// ─────────────────────────────────────────────────────────────────────────────
export const createTeacher = asyncHandler(async (req, res) => {
  const { fullName, mobile, email, subjects, classes, password = 'Vlm@1234' } = req.body;
  if (!fullName || !mobile)
    return res.status(400).json({ success: false, message: 'fullName and mobile are required' });

  const user = await User.create({ name: fullName, mobile, email, password, role: 'teacher' });
  const teacher = await Teacher.create({
    userId: user._id, fullName, mobile, subjects, classes,
    applicationStatus: 'approved',
  });

  res.status(201).json({ success: true, message: 'Teacher created', data: teacher });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/teachers/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  res.json({ success: true, message: 'Teacher updated', data: teacher });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/teachers/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findByIdAndDelete(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  await User.findByIdAndDelete(teacher.userId);
  res.json({ success: true, message: 'Teacher deleted' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/teachers/:id/approve
// ─────────────────────────────────────────────────────────────────────────────
export const approveTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  teacher.applicationStatus = 'approved';
  await teacher.save();
  res.json({ success: true, message: 'Teacher approved', data: teacher });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/teachers/:id/reject
// ─────────────────────────────────────────────────────────────────────────────
export const rejectTeacher = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  teacher.applicationStatus = 'rejected';
  teacher.rejectionReason = reason || 'Does not meet qualification criteria';
  await teacher.save();
  res.json({ success: true, message: 'Teacher rejected', data: teacher });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/teachers/:id/status
// ─────────────────────────────────────────────────────────────────────────────
export const updateTeacherStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });
  await User.findByIdAndUpdate(teacher.userId, { status, blockReason: reason });
  res.json({ success: true, message: `Teacher status updated to ${status}` });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/teachers/performance
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacherPerformance = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find({ applicationStatus: 'approved' })
    .select('fullName vlmTeacherId totalSessions rating totalEarnings');
  res.json({ success: true, data: teachers });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/teachers/earnings
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacherEarnings = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find({ applicationStatus: 'approved' })
    .select('fullName vlmTeacherId totalEarnings pendingWithdrawal totalWithdrawn');
  res.json({ success: true, data: teachers });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/teachers/wallet
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacherWallets = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const filter = id ? { userId: id } : { role: 'teacher' };
  const transactions = await WalletTransaction.find(filter)
    .sort({ createdAt: -1 }).limit(100)
    .populate('userId', 'name email');
  res.json({ success: true, data: transactions });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/teachers/withdrawals
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacherWithdrawals = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const withdrawals = await Withdrawal.find(filter)
    .sort({ createdAt: -1 })
    .populate('teacherId', 'fullName vlmTeacherId mobile bankDetails');
  res.json({ success: true, data: withdrawals });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/teachers/:id/availability
// ─────────────────────────────────────────────────────────────────────────────
export const updateTeacherAvailability = asyncHandler(async (req, res) => {
  const { isAvailable, slots } = req.body;
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return res.status(404).json({ success: false, message: 'Teacher not found' });

  let availability = await TeacherAvailability.findOne({ teacherId: teacher._id });
  if (!availability) {
    availability = new TeacherAvailability({ teacherId: teacher._id });
  }

  if (isAvailable !== undefined) availability.isAvailable = isAvailable;
  if (slots) availability.slots = slots;
  await availability.save();

  res.json({ success: true, message: 'Availability updated', data: availability });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/withdrawals
// ─────────────────────────────────────────────────────────────────────────────
export const getWithdrawals = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const skip = (page - 1) * limit;

  const [withdrawals, total] = await Promise.all([
    Withdrawal.find(filter)
      .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
      .populate('teacherId', 'fullName vlmTeacherId mobile'),
    Withdrawal.countDocuments(filter),
  ]);

  res.json({ success: true, data: withdrawals, pagination: { total, page: Number(page), limit: Number(limit) } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/withdrawals/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getWithdrawal = asyncHandler(async (req, res) => {
  const w = await Withdrawal.findById(req.params.id)
    .populate('teacherId', 'fullName vlmTeacherId mobile bankDetails');
  if (!w) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
  res.json({ success: true, data: w });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/withdrawals/:id/approve
// ─────────────────────────────────────────────────────────────────────────────
export const approveWithdrawal = asyncHandler(async (req, res) => {
  const w = await Withdrawal.findById(req.params.id);
  if (!w) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
  if (w.status !== 'pending') return res.status(400).json({ success: false, message: 'Already processed' });

  w.status = 'approved';
  w.processedAt = new Date();
  await w.save();

  res.json({ success: true, message: 'Withdrawal approved', data: w });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/withdrawals/:id/reject
// ─────────────────────────────────────────────────────────────────────────────
export const rejectWithdrawal = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const w = await Withdrawal.findById(req.params.id);
  if (!w) return res.status(404).json({ success: false, message: 'Withdrawal not found' });
  if (w.status !== 'pending') return res.status(400).json({ success: false, message: 'Already processed' });

  w.status = 'rejected';
  w.rejectionReason = reason || 'Bank details could not be verified';
  w.processedAt = new Date();
  await w.save();

  res.json({ success: true, message: 'Withdrawal rejected', data: w });
});
