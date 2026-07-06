import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Parent from '../models/Parent.js';
import User from '../models/User.js';
import DoubtRequest from '../models/DoubtRequest.js';
import AdminSettings from '../models/AdminSettings.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * Get Admin Dashboard Stats
 * GET /api/admin/dashboard
 */
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const totalStudents = await Student.countDocuments();
  const activeStudents = await User.countDocuments({ roles: 'student', status: 'active' });
  const totalTeachers = await Teacher.countDocuments();
  const activeTeachers = await User.countDocuments({ roles: 'teacher', status: 'active' });
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
