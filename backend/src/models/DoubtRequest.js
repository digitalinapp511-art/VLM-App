import mongoose from 'mongoose';
import { SESSION_STATUS } from '../config/constants.js';

const doubtRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    subject: String,
    class: String,
    board: String,
    language: String,
    sessionType: { type: String, enum: ['chat', 'audio', 'video', 'ai'] },
    doubtText: String,
    doubtImage: String,
    topic: String,
    preferredTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    routedTeachers: [{
      teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
      status: { type: String, enum: ['pending', 'accepted', 'rejected', 'missed', 'cancelled'], default: 'pending' },
      respondedAt: Date,
      timerExpiresAt: Date,
    }],
    assignedTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    status: { type: String, enum: Object.values(SESSION_STATUS), default: SESSION_STATUS.SEARCHING },
    timerExpiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('DoubtRequest', doubtRequestSchema);
