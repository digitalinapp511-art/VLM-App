import Parent from '../../models/Parent.js';
import Student from '../../models/Student.js';
import User from '../../models/User.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/parents
// ─────────────────────────────────────────────────────────────────────────────
export const getParents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const skip = (page - 1) * limit;
  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { mobile: { $regex: search, $options: 'i' } },
    ];
  }

  const [parents, total] = await Promise.all([
    Parent.find(filter)
      .populate('userId', 'email mobile status lastLogin')
      .skip(skip).limit(Number(limit)).sort({ createdAt: -1 }),
    Parent.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: parents,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/parents/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findById(req.params.id)
    .populate('userId', 'email mobile status')
    .populate('linkedStudents', 'fullName class board vlmStudentId');
  if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
  res.json({ success: true, data: parent });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/parents
// ─────────────────────────────────────────────────────────────────────────────
export const createParent = asyncHandler(async (req, res) => {
  const { fullName, mobile, email, password = 'Vlm@1234' } = req.body;
  if (!fullName || !mobile)
    return res.status(400).json({ success: false, message: 'fullName and mobile are required' });

  const user = await User.create({ name: fullName, mobile, email, password, role: 'parent' });
  const parent = await Parent.create({ userId: user._id, fullName, mobile });

  res.status(201).json({ success: true, message: 'Parent created', data: parent });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/admin/parents/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
  res.json({ success: true, message: 'Parent updated', data: parent });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/parents/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteParent = asyncHandler(async (req, res) => {
  const parent = await Parent.findByIdAndDelete(req.params.id);
  if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
  await User.findByIdAndDelete(parent.userId);
  res.json({ success: true, message: 'Parent deleted' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/parents/link  — link a parent to a student
// ─────────────────────────────────────────────────────────────────────────────
export const linkParentToStudent = asyncHandler(async (req, res) => {
  const { parentId, studentId } = req.body;
  if (!parentId || !studentId)
    return res.status(400).json({ success: false, message: 'parentId and studentId are required' });

  const [parent, student] = await Promise.all([
    Parent.findById(parentId),
    Student.findById(studentId),
  ]);

  if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Link both ways
  if (!parent.linkedStudents?.includes(studentId)) {
    await Parent.findByIdAndUpdate(parentId, { $addToSet: { linkedStudents: studentId } });
  }
  if (!student.linkedParents?.includes(parentId)) {
    await Student.findByIdAndUpdate(studentId, { $addToSet: { linkedParents: parentId } });
  }

  res.json({ success: true, message: 'Parent linked to student' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/parents/unlink  — unlink a parent from a student
// ─────────────────────────────────────────────────────────────────────────────
export const unlinkParentFromStudent = asyncHandler(async (req, res) => {
  const { parentId, studentId } = req.body;
  if (!parentId || !studentId)
    return res.status(400).json({ success: false, message: 'parentId and studentId are required' });

  await Promise.all([
    Parent.findByIdAndUpdate(parentId, { $pull: { linkedStudents: studentId } }),
    Student.findByIdAndUpdate(studentId, { $pull: { linkedParents: parentId } }),
  ]);

  res.json({ success: true, message: 'Parent unlinked from student' });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/parents/activity
// ─────────────────────────────────────────────────────────────────────────────
export const getParentActivity = asyncHandler(async (req, res) => {
  const parents = await Parent.find()
    .populate('userId', 'lastLogin status')
    .select('fullName mobile userId linkedStudents createdAt')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ success: true, data: parents });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/parents/reports
// ─────────────────────────────────────────────────────────────────────────────
export const getParentReports = asyncHandler(async (req, res) => {
  const total = await Parent.countDocuments();
  const linked = await Parent.countDocuments({ 'linkedStudents.0': { $exists: true } });
  const unlinked = total - linked;

  res.json({
    success: true,
    data: { total, linked, unlinked, linkRate: total ? ((linked / total) * 100).toFixed(2) : 0 },
  });
});
