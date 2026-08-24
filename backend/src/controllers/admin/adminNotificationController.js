import User from '../../models/User.js';
import Student from '../../models/Student.js';
import Teacher from '../../models/Teacher.js';
import Notification from '../../models/Notification.js';
import { broadcastNotification } from '../../services/notificationService.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import mongoose from 'mongoose';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve target audience into an array of User._id based on filters.
 * Filters: role, class, board, subscriptionStatus
 */
const resolveAudience = async (audience, filters = {}) => {
  if (audience === 'all') {
    const users = await User.find({ status: 'active' }).select('_id').lean();
    return users.map((u) => u._id);
  }

  if (audience === 'students') {
    let query = {};
    if (filters.class) query.class = filters.class;
    if (filters.board) query.board = { $regex: new RegExp(filters.board, 'i') };
    if (filters.subscriptionStatus) query['subscription.status'] = filters.subscriptionStatus;
    if (filters.state) query.state = { $regex: new RegExp(filters.state, 'i') };

    const students = await Student.find(query).select('userId').lean();
    return students.map((s) => s.userId);
  }

  if (audience === 'teachers') {
    const teachers = await Teacher.find({}).select('userId').lean();
    return teachers.map((t) => t.userId);
  }

  if (audience === 'custom' && filters.userIds?.length) {
    return filters.userIds.map((id) => new mongoose.Types.ObjectId(id));
  }

  return [];
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/admin/notifications
 * List all admin-sent notifications (broadcast history)
 */
export const getAdminNotificationsList = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type, broadcastId } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const filter = { createdBy: { $exists: true } };
  if (type) filter.type = type;
  if (broadcastId) filter.broadcastId = broadcastId;

  // Get unique broadcasts grouped
  const pipeline = [
    { $match: filter },
    {
      $group: {
        _id: '$broadcastId',
        type: { $first: '$type' },
        title: { $first: '$title' },
        message: { $first: '$message' },
        createdBy: { $first: '$createdBy' },
        sentAt: { $first: '$createdAt' },
        totalRecipients: { $sum: 1 },
        readCount: { $sum: { $cond: ['$isRead', 1, 0] } },
        fcmSent: { $sum: { $cond: ['$fcmSent', 1, 0] } },
      },
    },
    { $sort: { sentAt: -1 } },
    { $skip: skip },
    { $limit: Number(limit) },
  ];

  const broadcasts = await Notification.aggregate(pipeline);
  const total = await Notification.distinct('broadcastId', filter);

  res.json({
    success: true,
    data: broadcasts,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total.length,
      pages: Math.ceil(total.length / Number(limit)),
    },
  });
});

/**
 * GET /api/admin/notifications/stats
 * High-level stats for the notification dashboard card
 */
export const getNotificationStats = asyncHandler(async (req, res) => {
  const [totalSent, totalRead, totalFcm, byType] = await Promise.all([
    Notification.countDocuments({ createdBy: { $exists: true } }),
    Notification.countDocuments({ createdBy: { $exists: true }, isRead: true }),
    Notification.countDocuments({ createdBy: { $exists: true }, fcmSent: true }),
    Notification.aggregate([
      { $match: { createdBy: { $exists: true } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      totalSent,
      totalRead,
      readRate: totalSent > 0 ? Math.round((totalRead / totalSent) * 100) : 0,
      totalFcm,
      byType,
    },
  });
});

/**
 * POST /api/admin/notifications/send
 * Compose and immediately send a notification to a target audience.
 *
 * Body: { title, message, type, audience, filters, deepLink, imageUrl }
 *   audience: 'all' | 'students' | 'teachers' | 'custom'
 *   filters:  { class, board, subscriptionStatus, userIds[] }
 */
export const sendAdminNotification = asyncHandler(async (req, res) => {
  const {
    title,
    message,
    type = 'admin_announcement',
    audience = 'all',
    filters = {},
    deepLink = '',
    imageUrl,
  } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'title and message are required' });
  }

  const userIds = await resolveAudience(audience, filters);

  if (!userIds.length) {
    return res.status(400).json({ success: false, message: 'No recipients found for the selected audience' });
  }

  const result = await broadcastNotification(
    userIds,
    type,
    title,
    message,
    { imageUrl },
    {
      deepLink,
      createdBy: req.user._id,
    }
  );

  res.json({
    success: true,
    message: `Notification sent to ${result.count} users (${result.fcmSentCount} via push)`,
    data: result,
  });
});

/**
 * POST /api/admin/notifications/preview-count
 * Returns estimated recipient count for given audience/filters (before sending)
 */
export const previewAudienceCount = asyncHandler(async (req, res) => {
  const { audience, filters = {} } = req.body;
  const userIds = await resolveAudience(audience, filters);
  res.json({ success: true, count: userIds.length });
});

/**
 * DELETE /api/admin/notifications/broadcast/:broadcastId
 * Delete all notifications from a broadcast run
 */
export const deleteBroadcast = asyncHandler(async (req, res) => {
  const { broadcastId } = req.params;
  const result = await Notification.deleteMany({ broadcastId });
  res.json({ success: true, deleted: result.deletedCount });
});

/**
 * GET /api/admin/notifications/types
 * Return all valid notification type enums + their human labels
 */
export const getNotificationTypes = asyncHandler(async (_req, res) => {
  const types = [
    { value: 'daily_practice_reminder',  label: 'Daily Practice Reminder',  icon: '📚' },
    { value: 'trial_expiry_alert',        label: 'Trial Expiry Alert',        icon: '⏰' },
    { value: 'subscription_offer',        label: 'Subscription Offer',        icon: '🎁' },
    { value: 'scholarship_announcement',  label: 'Scholarship Announcement',  icon: '🏆' },
    { value: 'leaderboard_rank_update',   label: 'Leaderboard Rank Update',   icon: '📊' },
    { value: 'auto_payment_reminder',     label: 'Auto Payment Reminder',     icon: '💳' },
    { value: 'subscription_renewal',      label: 'Subscription Renewal',      icon: '🔄' },
    { value: 'mcq_reminder',              label: 'MCQ Reminder',              icon: '❓' },
    { value: 'teacher_join_alert',        label: 'Teacher Join Alert',        icon: '👨‍🏫' },
    { value: 'spin_unlock_alert',         label: 'Spin Unlock Alert',         icon: '🎰' },
    { value: 'admin_announcement',        label: 'Admin Announcement',        icon: '📢' },
    { value: 'custom',                    label: 'Custom',                    icon: '✏️' },
  ];
  res.json({ success: true, data: types });
});
