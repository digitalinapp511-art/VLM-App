import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    scheduledAt: Date,
    duration: { type: Number, default: 30 },
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'rescheduled', 'completed', 'missed', 'cancelled'],
      default: 'pending',
    },
    slotRequestedBy: { type: String, enum: ['teacher', 'admin'], default: 'teacher' },
    adminNotes: String,
    teacherNotes: String,
    recordingUrl: String,
    result: { type: String, enum: ['pending', 'passed', 'failed', 'on_hold'] },
    reminders: [{
      type: String,
      sentAt: Date,
    }],
  },
  { timestamps: true }
);

export default mongoose.model('Interview', interviewSchema);
