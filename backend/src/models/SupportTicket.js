import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'teacher', 'parent'] },
    category: {
      type: String,
      enum: [
        'kyc', 'interview', 'session', 'wallet', 'withdrawal', 'bug',
        'live_class', 'content', 'rating_dispute', 'complaint', 'referral',
        'payment', 'trial', 'autopay', 'other',
      ],
    },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    attachments: [String],
    status: {
      type: String,
      enum: ['open', 'in_review', 'resolved', 'closed', 'waiting_teacher', 'waiting_support'],
      default: 'open',
    },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    replies: [{
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      senderRole: String,
      message: String,
      attachments: [String],
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

export default mongoose.model('SupportTicket', supportTicketSchema);
