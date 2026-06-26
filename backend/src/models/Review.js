import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    overallRating: { type: Number, min: 1, max: 5 },
    explanationQuality: { type: Number, min: 1, max: 5 },
    clarity: { type: Number, min: 1, max: 5 },
    behaviour: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 },
    speed: { type: Number, min: 1, max: 5 },
    feedback: String,
    isPositive: { type: Boolean, default: true },
    teacherReply: String,
    isModerated: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('Review', reviewSchema);
