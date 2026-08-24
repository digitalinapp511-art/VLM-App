import mongoose from 'mongoose';

const NOTIFICATION_TYPES = [
  'daily_practice_reminder',
  'trial_expiry_alert',
  'subscription_offer',
  'scholarship_announcement',
  'leaderboard_rank_update',
  'auto_payment_reminder',
  'subscription_renewal',
  'mcq_reminder',
  'teacher_join_alert',
  'spin_unlock_alert',
  'admin_announcement',
  'parent_link_request',
  'alert',
  'success',
  'info',
  'custom',
];

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    title: { type: String, required: true },
    message: String,
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    deepLink: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },

    // FCM tracking
    fcmSent: { type: Boolean, default: false },
    fcmMessageId: { type: String },

    // Admin-created broadcast fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    broadcastId: { type: String }, // groups notifications sent in same broadcast
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ broadcastId: 1 });

export default mongoose.model('Notification', notificationSchema);
