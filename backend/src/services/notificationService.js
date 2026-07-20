import Notification from '../models/Notification.js';
import { getIo } from '../socket/index.js';
import { publishSocketEvent } from './redisService.js';

export const createNotification = async (userId, type, title, message, data = {}, deepLink = '') => {
  const notif = await Notification.create({ userId, type, title, message, data, deepLink });

  try {
    const room = `user:${userId.toString()}`;
    const payload = {
      _id: notif._id.toString(),
      userId: userId.toString(),
      type,
      title,
      message,
      data,
      deepLink,
      isRead: false,
      createdAt: notif.createdAt
    };

    // Primary: Direct emit via local socket.io
    const io = getIo();
    if (io) {
      io.to(room).emit('new_notification', payload);
      console.log(`[NotificationService] Emitted new_notification directly to room ${room}`);
    }

    // Secondary: Publish via Redis Pub/Sub for multi-process instances
    await publishSocketEvent(room, 'new_notification', payload);
  } catch (err) {
    console.error('[NotificationService Live Emit Error]', err.message);
  }

  return notif;
};

export const notifyMultiple = async (userIds, type, title, message, data = {}) => {
  const notifications = userIds.map((userId) => ({
    userId, type, title, message, data,
  }));
  return Notification.insertMany(notifications);
};
