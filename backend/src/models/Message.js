import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['student', 'teacher', 'system'] },
    type: { type: String, enum: ['text', 'image', 'audio', 'system'], default: 'text' },
    content: String,
    mediaUrl: String,
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
    readAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Message', messageSchema);
