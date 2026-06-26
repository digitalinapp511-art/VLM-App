import mongoose from 'mongoose';
import { SESSION_TYPES, SESSION_STATUS } from '../config/constants.js';

const sessionSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    type: { type: String, enum: Object.values(SESSION_TYPES), required: true },
    status: { type: String, enum: Object.values(SESSION_STATUS), default: SESSION_STATUS.PENDING },
    subject: String,
    class: String,
    board: String,
    language: String,
    topic: String,
    chapter: String,
    doubtText: String,
    doubtImage: String,
    questionType: String,
    isPreferredTeacher: { type: Boolean, default: false },
    routedTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    acceptedAt: Date,
    startedAt: Date,
    endedAt: Date,
    duration: Number,
    timerExpiresAt: Date,
    inactivityWarningAt: Date,
    teacherSummary: String,
    keyNotes: String,
    studentBehaviourRating: Number,
    isResolved: { type: Boolean, default: false },
    resolvedAt: Date,
    recording: {
      url: String,
      status: { type: String, enum: ['recording', 'processing', 'ready', 'failed'], default: 'processing' },
      duration: Number,
    },
    transcript: String,
    earnings: {
      points: Number,
      status: { type: String, enum: ['pending', 'eligible', 'credited', 'reversed'], default: 'pending' },
    },
    escalation: {
      isEscalated: { type: Boolean, default: false },
      ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket' },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Session', sessionSchema);
