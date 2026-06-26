import mongoose from 'mongoose';

const liveClassSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    topic: { type: String, required: true },
    subject: String,
    class: String,
    board: String,
    language: String,
    scheduledAt: Date,
    description: String,
    isFree: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected', 'needs_changes', 'live', 'ended', 'cancelled'],
      default: 'pending',
    },
    rejectionReason: String,
    attendees: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      joinedAt: Date,
      leftAt: Date,
      duration: Number,
    }],
    recording: { url: String, status: String, duration: Number },
    metrics: {
      attendance: Number,
      rating: Number,
      duration: Number,
    },
    startedAt: Date,
    endedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('LiveClass', liveClassSchema);
