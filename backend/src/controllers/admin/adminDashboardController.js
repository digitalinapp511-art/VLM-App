import Student from '../../models/Student.js';
import Teacher from '../../models/Teacher.js';
import Parent from '../../models/Parent.js';
import User from '../../models/User.js';
import DoubtRequest from '../../models/DoubtRequest.js';
import Session from '../../models/Session.js';
import WalletTransaction from '../../models/WalletTransaction.js';
import LiveClass from '../../models/LiveClass.js';
import ShortVideo from '../../models/ShortVideo.js';
import McqTask from '../../models/McqTask.js';
import SupportTicket from '../../models/SupportTicket.js';
import Notification from '../../models/Notification.js';
import { asyncHandler } from '../../middleware/errorHandler.js';

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [
    totalStudents, totalTeachers, totalParents,
    activeStudents, activeTeachers,
    pendingDoubts, pendingTeachers,
    totalSessions, openTickets,
    totalRevenueTx,
  ] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Parent.countDocuments(),
    User.countDocuments({ role: 'student', status: 'active' }),
    User.countDocuments({ role: 'teacher', status: 'active' }),
    DoubtRequest.countDocuments({ status: 'searching' }),
    Teacher.countDocuments({ applicationStatus: { $in: ['submitted', 'under_review'] } }),
    Session.countDocuments(),
    SupportTicket.countDocuments({ status: 'open' }),
    WalletTransaction.find({ type: 'credit', role: 'student' }),
  ]);

  const totalRevenue = totalRevenueTx.reduce((s, t) => s + (t.inrAmount || 0), 0);

  res.json({
    success: true,
    data: {
      totalStudents, totalTeachers, totalParents,
      activeStudents, activeTeachers,
      pendingDoubts, pendingTeachers,
      totalSessions, openTickets, totalRevenue,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/live-stats
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardLiveStats = asyncHandler(async (req, res) => {
  const [activeSessions, liveDoubts, liveLiveClasses] = await Promise.all([
    Session.countDocuments({ status: { $in: ['active', 'ongoing'] } }),
    DoubtRequest.countDocuments({ status: 'searching' }),
    LiveClass.countDocuments({ status: 'live' }),
  ]);

  res.json({
    success: true,
    data: {
      activeSessions,
      liveDoubts,
      liveLiveClasses,
      timestamp: new Date(),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/analytics
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [newStudents, newTeachers, newSessions, completedMcqs] = await Promise.all([
    Student.countDocuments({ createdAt: { $gte: since } }),
    Teacher.countDocuments({ createdAt: { $gte: since } }),
    Session.countDocuments({ createdAt: { $gte: since } }),
    McqTask.countDocuments({ status: 'completed', completedAt: { $gte: since } }),
  ]);

  res.json({
    success: true,
    data: {
      period: `Last ${days} days`,
      newStudents,
      newTeachers,
      newSessions,
      completedMcqs,
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/revenue
// ─────────────────────────────────────────────────────────────────────────────
export const getDashboardRevenue = asyncHandler(async (req, res) => {
  const txs = await WalletTransaction.find({ type: 'credit', role: 'student', inrAmount: { $gt: 0 } });
  const total = txs.reduce((s, t) => s + (t.inrAmount || 0), 0);
  const appShare = total * 0.25;
  const teacherShare = total * 0.75;

  res.json({
    success: true,
    data: { totalRevenue: total, appCommission: appShare, teacherShare, commissionRate: 25 },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/system-health
// ─────────────────────────────────────────────────────────────────────────────
export const getSystemHealth = asyncHandler(async (req, res) => {
  const memUsage = process.memoryUsage();
  res.json({
    success: true,
    data: {
      status: 'healthy',
      uptime: process.uptime(),
      memory: {
        heapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (memUsage.heapTotal / 1024 / 1024).toFixed(2),
        rssMB: (memUsage.rss / 1024 / 1024).toFixed(2),
      },
      node: process.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date(),
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/recent-activities
// ─────────────────────────────────────────────────────────────────────────────
export const getRecentActivities = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;

  const [recentDoubts, recentSessions, recentTickets] = await Promise.all([
    DoubtRequest.find().sort({ createdAt: -1 }).limit(limit)
      .populate('studentId', 'fullName').lean(),
    Session.find().sort({ createdAt: -1 }).limit(limit)
      .populate('studentId', 'fullName').lean(),
    SupportTicket.find().sort({ createdAt: -1 }).limit(limit)
      .populate('userId', 'name email').lean(),
  ]);

  res.json({
    success: true,
    data: { recentDoubts, recentSessions, recentTickets },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/dashboard/notifications
// ─────────────────────────────────────────────────────────────────────────────
export const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 }).limit(50);
  res.json({ success: true, data: notifications });
});

// ─────────────────────────────────────────────────────────────────────────────
// FOUNDER DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

export const getFounderDashboard = asyncHandler(async (req, res) => {
  const [students, teachers, revenue] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    WalletTransaction.find({ type: 'credit', role: 'student', inrAmount: { $gt: 0 } }),
  ]);

  const totalRevenue = revenue.reduce((s, t) => s + (t.inrAmount || 0), 0);

  res.json({
    success: true,
    data: { totalStudents: students, totalTeachers: teachers, totalRevenue },
  });
});

export const getFounderRevenue = asyncHandler(async (req, res) => {
  const txs = await WalletTransaction.find({ type: 'credit', inrAmount: { $gt: 0 } })
    .sort({ createdAt: -1 });
  const total = txs.reduce((s, t) => s + (t.inrAmount || 0), 0);
  res.json({ success: true, data: { total, transactions: txs } });
});

export const getFounderUserGrowth = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [students, teachers, parents] = await Promise.all([
    Student.countDocuments({ createdAt: { $gte: since } }),
    Teacher.countDocuments({ createdAt: { $gte: since } }),
    Parent.countDocuments({ createdAt: { $gte: since } }),
  ]);

  res.json({ success: true, data: { period: `Last ${days} days`, students, teachers, parents } });
});

export const getFounderRetention = asyncHandler(async (req, res) => {
  // Retention approximated by active users with sessions in the last 30 days
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const activeStudentIds = await Session.distinct('studentId', { createdAt: { $gte: since } });
  const totalStudents = await Student.countDocuments();

  res.json({
    success: true,
    data: {
      retainedStudents: activeStudentIds.length,
      totalStudents,
      retentionRate: totalStudents ? ((activeStudentIds.length / totalStudents) * 100).toFixed(2) : 0,
    },
  });
});

export const getFounderChurn = asyncHandler(async (req, res) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);
  const activeStudentIds = await Session.distinct('studentId', { createdAt: { $gte: since } });
  const totalStudents = await Student.countDocuments();
  const churnedCount = Math.max(0, totalStudents - activeStudentIds.length);

  res.json({
    success: true,
    data: {
      churnedStudents: churnedCount,
      totalStudents,
      churnRate: totalStudents ? ((churnedCount / totalStudents) * 100).toFixed(2) : 0,
    },
  });
});

export const getFounderMarketing = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      note: 'Marketing analytics will be populated when UTM tracking and ad integrations are connected.',
      channels: ['organic', 'referral', 'paid'],
    },
  });
});

export const getFounderAiUsage = asyncHandler(async (req, res) => {
  const totalAiSessions = await Session.countDocuments({ sessionType: 'ai' });
  res.json({ success: true, data: { totalAiSessions } });
});

export const getFounderLiveSessionAnalytics = asyncHandler(async (req, res) => {
  const [totalSessions, activeSessions, totalLiveClasses] = await Promise.all([
    Session.countDocuments(),
    Session.countDocuments({ status: { $in: ['active', 'ongoing'] } }),
    LiveClass.countDocuments(),
  ]);

  res.json({ success: true, data: { totalSessions, activeSessions, totalLiveClasses } });
});

export const getFounderBusinessSummary = asyncHandler(async (req, res) => {
  const [students, teachers, parents, sessions, revenue] = await Promise.all([
    Student.countDocuments(),
    Teacher.countDocuments(),
    Parent.countDocuments(),
    Session.countDocuments(),
    WalletTransaction.find({ type: 'credit', inrAmount: { $gt: 0 } }),
  ]);

  const totalRevenue = revenue.reduce((s, t) => s + (t.inrAmount || 0), 0);

  res.json({
    success: true,
    data: {
      students, teachers, parents, sessions,
      totalRevenue, appRevenue: totalRevenue * 0.25, teacherRevenue: totalRevenue * 0.75,
      generatedAt: new Date(),
    },
  });
});
