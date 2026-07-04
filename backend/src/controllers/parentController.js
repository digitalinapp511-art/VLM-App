import Parent from '../models/Parent.js';
import Student from '../models/Student.js';
import Session from '../models/Session.js';
import ParentChildRequest from '../models/ParentChildRequest.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { createNotification } from '../services/notificationService.js';
import { getIo } from '../socket/index.js';
import { generateVlmId } from '../utils/vlmIdGenerator.js';

export const createParentProfile = asyncHandler(async (req, res) => {
  let parent = await Parent.findOne({ userId: req.user._id });
  if (parent) {
    Object.assign(parent, req.body);
    await parent.save();
  } else {
    const vlmParentId = await generateVlmId('PAR');
    parent = await Parent.create({ userId: req.user._id, vlmParentId, ...req.body });
  }
  res.json({ success: true, data: parent });
});

export const getParentProfile = asyncHandler(async (req, res) => {
  const parent = await Parent.findOne({ userId: req.user._id })
    .populate('userId', 'email mobile fullName')
    .populate({ path: 'linkedChildren.studentId', select: 'fullName class board school totalPoints streak vlmStudentId' });
  if (!parent) return res.status(404).json({ success: false, message: 'Profile not found' });
  res.json({ success: true, data: parent });
});

export const linkChild = asyncHandler(async (req, res) => {
  const { studentMobile, studentId, isQrScan } = req.body;
  let parent = await Parent.findOne({ userId: req.user._id });
  if (!parent) {
    const vlmParentId = await generateVlmId('PAR');
    parent = await Parent.create({ userId: req.user._id, fullName: 'Parent', vlmParentId });
  }

  let student;
  if (studentId) {
    const cleanId = studentId.trim().toUpperCase();
    // Accept VLM-STU-XXXXXX format
    if (/^VLM-STU-\d{6}$/.test(cleanId)) {
      student = await Student.findOne({ vlmStudentId: cleanId });
    } else {
      const mongoose = (await import('mongoose')).default;
      if (!mongoose.Types.ObjectId.isValid(studentId.trim())) {
        return res.status(400).json({ success: false, message: 'Invalid Student ID format. Use VLM-STU-000001 format or a valid database Object ID.' });
      }
      student = await Student.findById(studentId.trim());
    }
  } else if (studentMobile) {
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ mobile: studentMobile });
    if (user) student = await Student.findOne({ userId: user._id });
  }

  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  // Check if link already exists as approved
  const exists = parent.linkedChildren.find((c) => c.studentId?.toString() === student._id.toString() && c.status === 'approved');
  if (exists) {
    return res.status(400).json({ success: false, message: 'Child is already linked' });
  }

  // Check requests collection for duplicates
  const pendingRequest = await ParentChildRequest.findOne({
    parentId: parent._id,
    studentId: student._id,
    status: 'pending'
  });

  if (pendingRequest && !isQrScan) {
    return res.status(400).json({ success: false, message: 'Link request is already pending approval from student' });
  }

  const status = isQrScan ? 'approved' : 'pending';
  
  // Create request document in DB
  const newRequest = await ParentChildRequest.create({
    parentId: parent._id,
    studentId: student._id,
    status,
    isQrScan: !!isQrScan
  });

  if (isQrScan) {
    // Approve immediately
    const hasChildLinkObj = parent.linkedChildren.find((c) => c.studentId?.toString() === student._id.toString());
    if (!hasChildLinkObj) {
      parent.linkedChildren.push({ studentId: student._id, status: 'approved', linkedAt: new Date() });
    } else {
      hasChildLinkObj.status = 'approved';
      hasChildLinkObj.linkedAt = new Date();
    }
    await parent.save();

    if (!student.linkedParents.includes(parent._id)) {
      student.linkedParents.push(parent._id);
      await student.save();
    }
  } else {
    // If not QR scan, add to linkedChildren in pending status
    const hasChildLinkObj = parent.linkedChildren.find((c) => c.studentId?.toString() === student._id.toString());
    if (!hasChildLinkObj) {
      parent.linkedChildren.push({ studentId: student._id, status: 'pending' });
      await parent.save();
    }

    if (!student.linkedParents.includes(parent._id)) {
      student.linkedParents.push(parent._id);
      await student.save();
    }

    // Notify student via Socket.io
    const io = getIo();
    if (io) {
      io.to(`user:${student.userId}`).emit('parent_link_request', {
        requestId: newRequest._id,
        parentName: parent.fullName,
        parentId: parent._id,
        parentEmailOrMobile: req.user.email || req.user.mobile,
        message: `Parent ${parent.fullName} wants to link with your account.`
      });
    }

    // Save notification in database
    await createNotification(
      student.userId,
      'parent_link_request',
      'Parent Link Request',
      `Parent ${parent.fullName} wants to link with your account.`,
      { parentId: parent._id, requestId: newRequest._id }
    );
  }

  const message = isQrScan ? 'Child linked successfully' : 'Link request sent to child';
  res.json({ success: true, data: parent, message });
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
