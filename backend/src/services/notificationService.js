import Notification from '../models/Notification.js';

export const createNotification = async (userId, type, title, message, data = {}, deepLink = '') => {
  return Notification.create({ userId, type, title, message, data, deepLink });
};

export const notifyMultiple = async (userIds, type, title, message, data = {}) => {
  const notifications = userIds.map((userId) => ({
    userId, type, title, message, data,
  }));
  return Notification.insertMany(notifications);
};
