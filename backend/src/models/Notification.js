import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    message: String,
    data: mongoose.Schema.Types.Mixed,
    isRead: { type: Boolean, default: false },
    deepLink: String,
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', notificationSchema);
