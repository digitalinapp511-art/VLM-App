import mongoose from 'mongoose';

const mcqTaskSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    class: String,
    date: { type: Date, required: true },
    questions: [{
      subject: String,
      question: String,
      options: [String],
      correctAnswer: Number,
      explanation: String,
      isRevision: { type: Boolean, default: false },
    }],
    timerSeconds: Number,
    status: { type: String, enum: ['pending', 'in_progress', 'completed'], default: 'pending' },
    answers: [{
      questionIndex: Number,
      selectedAnswer: Number,
      isCorrect: Boolean,
      timeTaken: Number,
    }],
    score: Number,
    pointsEarned: Number,
    startedAt: Date,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model('McqTask', mcqTaskSchema);
