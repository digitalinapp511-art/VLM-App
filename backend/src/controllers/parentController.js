import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import Session from '../models/Session.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const createParentProfile = asyncHandler(async (req, res) => {
  let parent = await Parent.findOne({ userId: req.user._id });
  if (parent) {
    Object.assign(parent, req.body);
    await parent.save();
  } else {
    parent = await Parent.create({ userId: req.user._id, ...req.body });
  }
  res.json({ success: true, data: parent });
});

export const getParentProfile = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ userId: req.user._id })
    .populate({ path: 'linkedChildren.studentId', select: 'fullName class board school totalPoints streak' });
  if (!parent) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: parent });
});

export const linkChild = asyncHandler(async (req, res) => {
  const { studentMobile, studentId } = req.body;
  const parent = await Parent.findOne({ userId: req.user._id });

  let student;
  if (studentId) {
    student = await Student.findById(studentId);
  } else if (studentMobile) {
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ mobile: studentMobile });
    if (user) student = await Student.findOne({ userId: user._id });
  }

  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const exists = parent.linkedChildren.find((c) => c.studentId?.toString() === student._id.toString());
  if (!exists) {
    parent.linkedChildren.push({ studentId: student._id, status: 'pending' });
    await parent.save();
    student.linkedParents.push(parent._id);
    await student.save();
  }

  res.json({ success: true, data: parent, message: 'Link request sent' });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ userId: req.user._id })
    .populate({ path: 'linkedChildren.studentId' });
  if (!parent) return res.status(404).json({ success: false, message: 'Not found' });

  const childrenData = [];
  for (const child of parent.linkedChildren) {
    if (!child.studentId || child.status !== 'approved') continue;
    const student = child.studentId;
    const sessions = await Session.find({ studentId: student._id }).sort({ createdAt: -1 }).limit(10);
    const resolved = sessions.filter((s) => s.isResolved).length;
    childrenData.push({
      student,
      stats: {
        totalSessions: sessions.length,
        resolvedDoubts: resolved,
        pendingDoubts: sessions.length - resolved,
        totalPoints: student.totalPoints,
        streak: student.streak,
        subscription: student.subscription,
      },
      recentSessions: sessions.slice(0, 5),
    });
  }

  res.json({ success: true, data: { parent, children: childrenData } });
});

export const updateControls = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ userId: req.user._id });
  parent.controls = { ...parent.controls, ...req.body };
  await parent.save();
  res.json({ success: true, data: parent.controls });
});
