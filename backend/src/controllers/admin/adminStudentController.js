import Student from '../../models/Student.js';
import User from '../../models/User.js';
import Session from '../../models/Session.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students   — list with pagination & optional filters
// ─────────────────────────────────────────────────────────────────────────────
export const getStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, class: cls, board, status, search } = req.query;
  const skip = (page - 1) * limit;
  const filter = {};

  if (cls) filter.class = cls;
  if (board) filter.board = board;
  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
      { vlmStudentId: { $regex: search, $options: 'i' } },
    ];
  }

  const [students, total] = await Promise.all([
    Student.find(filter)
      .populate('userId', 'email mobile status lastLogin')
      .skip(skip).limit(Number(limit))
      .sort({ createdAt: -1 }),
    Student.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: students,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/search
// ─────────────────────────────────────────────────────────────────────────────
export const searchStudents = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ success: false, message: 'Query parameter q is required' });

  const students = await Student.find({
    $or: [
      { fullName: { $regex: q, $options: 'i' } },
      { mobile: { $regex: q, $options: 'i' } },
      { vlmStudentId: { $regex: q, $options: 'i' } },
    ],
  }).limit(20).populate('userId', 'email status');

  res.json({ success: true, data: students });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/filter
// ─────────────────────────────────────────────────────────────────────────────
export const filterStudents = asyncHandler(async (req, res) => {
  const { class: cls, board, subscription, minPoints, maxPoints } = req.query;
  const filter = {};

  if (cls) filter.class = cls;
  if (board) filter.board = board;
  if (subscription) filter['subscription.status'] = subscription;
  if (minPoints || maxPoints) {
    filter.totalPoints = {};
    if (minPoints) filter.totalPoints.$gte = Number(minPoints);
    if (maxPoints) filter.totalPoints.$lte = Number(maxPoints);
  }

  const students = await Student.find(filter).populate('userId', 'email status lastLogin');
  res.json({ success: true, data: students, count: students.length });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id)
    .populate('userId', 'email mobile status lastLogin createdAt')
    .populate('linkedParents', 'fullName mobile');

  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: student });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/students  — create student record manually
// ─────────────────────────────────────────────────────────────────────────────
export const createStudent = asyncHandler(async (req, res) => {
  const { fullName, mobile, email, class: cls, board, password = 'Vlm@1234' } = req.body;
  if (!fullName || !mobile)
    return res.status(400).json({ success: false, message: 'fullName and mobile are required' });

  // Create user account
  const user = await User.create({ name: fullName, mobile, email, password, role: 'student' });
  const student = await Student.create({ userId: user._id, fullName, mobile, class: cls, board });

  res.status(201).json({ success: true, message: 'Student created', data: student });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/students/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, message: 'Student updated', data: student });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/students/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  // Optionally remove User record too
  await User.findByIdAndDelete(student.userId);
  res.json({ success: true, message: 'Student deleted successfully' });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/students/:id/status
// ─────────────────────────────────────────────────────────────────────────────
export const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const allowedStatuses = ['active', 'blocked', 'suspended', 'inactive'];
  if (!allowedStatuses.includes(status))
    return res.status(400).json({ success: false, message: `Status must be one of: ${allowedStatuses.join(', ')}` });

  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  await User.findByIdAndUpdate(student.userId, { status, blockReason: reason });
  res.json({ success: true, message: `Student status updated to ${status}` });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/students/:id/wallet
// ─────────────────────────────────────────────────────────────────────────────
export const updateStudentWallet = asyncHandler(async (req, res) => {
  const { points, inrAmount, description, type = 'credit' } = req.body;
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  if (type === 'credit') {
    student.totalPoints += (points || 0);
    student.wallet.totalPoints += (points || 0);
    student.wallet.balance += (inrAmount || 0);
  } else {
    student.totalPoints -= (points || 0);
    student.wallet.totalPoints -= (points || 0);
    student.wallet.balance -= (inrAmount || 0);
  }

  student.markModified('wallet');
  await student.save();

  await WalletTransaction.create({
    userId: student.userId, role: 'student', type,
    points: points || 0, inrAmount: inrAmount || 0,
    description: description || 'Admin wallet adjustment',
    isAdminAdjustment: true,
  });

  res.json({ success: true, message: 'Wallet updated', wallet: student.wallet });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/students/:id/subscription
// ─────────────────────────────────────────────────────────────────────────────
export const updateStudentSubscription = asyncHandler(async (req, res) => {
  const { planId, status, expiresAt } = req.body;
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  if (planId) student.subscription.planId = planId;
  if (status) student.subscription.status = status;
  if (expiresAt) student.subscription.expiresAt = new Date(expiresAt);

  student.markModified('subscription');
  await student.save();

  res.json({ success: true, message: 'Subscription updated', subscription: student.subscription });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/students/:id/kyc
// ─────────────────────────────────────────────────────────────────────────────
export const updateStudentKyc = asyncHandler(async (req, res) => {
  const { kycStatus, documents } = req.body;
  const student = await Student.findByIdAndUpdate(
    req.params.id,
    { kycStatus, kycDocuments: documents },
    { new: true }
  );
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, message: 'KYC updated', data: student });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/:id/activity
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentActivity = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const [sessions, transactions] = await Promise.all([
    Session.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(20),
    WalletTransaction.find({ userId: student.userId }).sort({ createdAt: -1 }).limit(20),
  ]);

  res.json({ success: true, data: { sessions, transactions } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/:id/sessions
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentSessions = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const sessions = await Session.find({ studentId: student._id })
    .sort({ createdAt: -1 })
    .populate('teacherId', 'fullName vlmTeacherId');

  res.json({ success: true, data: sessions });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/:id/devices
// ─────────────────────────────────────────────────────────────────────────────
export const getStudentDevices = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).select('devices deviceTokens');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  res.json({ success: true, data: { devices: student.devices || [], deviceTokens: student.deviceTokens || [] } });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/students/export
// ─────────────────────────────────────────────────────────────────────────────
export const exportStudents = asyncHandler(async (req, res) => {
  const students = await Student.find()
    .select('fullName mobile email class board vlmStudentId totalPoints subscription.status createdAt')
    .lean();

  // Simple CSV generation
  const headers = ['Name', 'Mobile', 'Email', 'Class', 'Board', 'Student ID', 'Points', 'Subscription', 'Joined'];
  const rows = students.map(s => [
    s.fullName, s.mobile, s.email || '', s.class || '', s.board || '',
    s.vlmStudentId || '', s.totalPoints || 0, s.subscription?.status || '',
    new Date(s.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
  res.send(csv);
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/students/bulk-import
// ─────────────────────────────────────────────────────────────────────────────
export const bulkImportStudents = asyncHandler(async (req, res) => {
  const { students } = req.body;
  if (!Array.isArray(students) || students.length === 0)
    return res.status(400).json({ success: false, message: 'students array is required' });

  const results = { created: 0, failed: 0, errors: [] };

  for (const s of students) {
    try {
      if (!s.fullName || !s.mobile) throw new Error('fullName and mobile required');
      const user = await User.create({ name: s.fullName, mobile: s.mobile, email: s.email, role: 'student', password: s.password || 'Vlm@1234' });
      await Student.create({ userId: user._id, fullName: s.fullName, mobile: s.mobile, class: s.class, board: s.board });
      results.created++;
    } catch (err) {
      results.failed++;
      results.errors.push({ entry: s.mobile, error: err.message });
    }
  }

  res.json({ success: true, message: 'Bulk import complete', results });
});
