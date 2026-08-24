import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { getIo } from '../socket/index.js';
import { publishSocketEvent } from './redisService.js';
import { sendPushToTokens } from './fcmService.js';

/**
 * Create a single notification, emit via Socket.io, and send FCM push.
 * @param {ObjectId} userId  - recipient's User._id
 * @param {string}   type    - notification type enum
 * @param {string}   title
 * @param {string}   message
 * @param {object}   data    - extra payload
 * @param {string}   deepLink
 * @param {object}   options - { priority, broadcastId, createdBy }
 */
export const createNotification = async (
  userId,
  type,
  title,
  message,
  data = {},
  deepLink = '',
  options = {}
) => {
  const notif = await Notification.create({
    userId,
    type,
    title,
    message,
    data,
    deepLink,
    priority: options.priority || 'medium',
    broadcastId: options.broadcastId,
    createdBy: options.createdBy,
  });

  const payload = {
    _id: notif._id.toString(),
    userId: userId.toString(),
    type,
    title,
    message,
    data,
    deepLink,
    isRead: false,
    createdAt: notif.createdAt,
  };

  // ── Socket.io real-time (in-app) ──────────────────────────────────────────
  try {
    const room = `user:${userId.toString()}`;
    const io = getIo();
    if (io) io.to(room).emit('new_notification', payload);
    await publishSocketEvent(room, 'new_notification', payload);
  } catch (err) {
    console.error('[NotificationService] Socket emit error:', err.message);
  }

  // ── Firebase Cloud Messaging (push) ───────────────────────────────────────
  try {
    const user = await User.findById(userId).select('deviceTokens').lean();
    const tokens = (user?.deviceTokens || []).filter(Boolean);
    if (tokens.length > 0) {
      const { staleTokens } = await sendPushToTokens(tokens, {
        title,
        body: message,
        data: { ...data, deepLink, notifId: notif._id.toString(), type },
      });
      // Purge stale tokens from database
      if (staleTokens?.length > 0) {
        await User.updateOne(
          { _id: userId },
          { $pull: { deviceTokens: { $in: staleTokens } } }
        );
      }
      // Mark FCM as sent
      await Notification.updateOne({ _id: notif._id }, { fcmSent: true });
    }
  } catch (err) {
    console.error('[NotificationService] FCM push error:', err.message);
  }

  return notif;
};

/**
 * Broadcast a notification to many users (admin-triggered).
 * Saves individual Notification docs in bulk, sends FCM in batches.
 *
 * @param {ObjectId[]} userIds     - array of User._id
 * @param {string}     type
 * @param {string}     title
 * @param {string}     message
 * @param {object}     data
 * @param {object}     options     - { priority, deepLink, broadcastId, createdBy }
 */
export const broadcastNotification = async (userIds, type, title, message, data = {}, options = {}) => {
  if (!userIds?.length) return { count: 0 };

  const broadcastId = options.broadcastId || `broadcast_${Date.now()}`;

  // Bulk insert notification docs
  const docs = userIds.map((userId) => ({
    userId,
    type,
    title,
    message,
    data,
    deepLink: options.deepLink || '',
    priority: options.priority || 'medium',
    broadcastId,
    createdBy: options.createdBy,
    fcmSent: false,
  }));
  await Notification.insertMany(docs, { ordered: false });

  // Fetch all device tokens for these users
  const users = await User.find({ _id: { $in: userIds } })
    .select('deviceTokens')
    .lean();

  const allTokens = users.flatMap((u) => u.deviceTokens || []).filter(Boolean);

  let fcmSentCount = 0;
  if (allTokens.length > 0) {
    const { staleTokens } = await sendPushToTokens(allTokens, {
      title,
      body: message,
      data: { ...data, type, deepLink: options.deepLink || '', broadcastId },
    });

    // Purge stale tokens globally
    if (staleTokens?.length > 0) {
      await User.updateMany(
        { deviceTokens: { $in: staleTokens } },
        { $pull: { deviceTokens: { $in: staleTokens } } }
      );
    }

    fcmSentCount = allTokens.length - (staleTokens?.length || 0);

    // Mark notifications for this broadcast as fcmSent
    await Notification.updateMany({ broadcastId }, { fcmSent: true });
  }

  return { count: userIds.length, fcmSentCount, broadcastId };
};

/**
 * Legacy helper — kept for backward compat with existing callers
 */
export const notifyMultiple = async (userIds, type, title, message, data = {}) => {
  const notifications = userIds.map((userId) => ({
    userId, type, title, message, data,
  }));
  return Notification.insertMany(notifications);
};
