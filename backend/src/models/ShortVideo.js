import mongoose from 'mongoose';

const shortVideoSchema = new mongoose.Schema(
  {
    uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uploaderRole: { type: String, enum: ['student', 'teacher'] },
    title: { type: String, required: true },
    description: String,
    videoUrl: String,
    thumbnailUrl: String,
    duration: Number,
    class: String,
    subject: String,
    topic: String,
    language: String,
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'needs_changes'],
      default: 'pending',
    },
    moderationNotes: String,
    rejectionReason: String,
    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    shares: { type: Number, default: 0 },
    sharedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: String,
      createdAt: { type: Date, default: Date.now },
    }],
    rewardPoints: { type: Number, default: 0 },
    viewBonusPoints: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('ShortVideo', shortVideoSchema);
