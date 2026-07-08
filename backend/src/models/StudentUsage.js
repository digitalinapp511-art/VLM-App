import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    loginAt: Date,
    logoutAt: Date,
    durationMinutes: Number,
    device: String,
    platform: String,
  },
  { _id: false }
);

const studentUsageSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    // App Usage
    totalActiveMinutes: {
      type: Number,
      default: 0,
    },

    totalActiveSeconds: {
      type: Number,
      default: 0,
    },

    loginCount: {
      type: Number,
      default: 0,
    },

    sessions: [sessionSchema],

    // Learning
    studyMinutes: {
      type: Number,
      default: 0,
    },

    videoWatchMinutes: {
      type: Number,
      default: 0,
    },

    notesReadingMinutes: {
      type: Number,
      default: 0,
    },

    practiceMinutes: {
      type: Number,
      default: 0,
    },

    // Quiz
    quizzesAttempted: {
      type: Number,
      default: 0,
    },

    quizzesCompleted: {
      type: Number,
      default: 0,
    },

    averageQuizScore: {
      type: Number,
      default: 0,
    },

    // Homework
    homeworkSubmitted: {
      type: Number,
      default: 0,
    },

    // Doubts
    doubtsAsked: {
      type: Number,
      default: 0,
    },

    doubtsResolved: {
      type: Number,
      default: 0,
    },

    // Classes
    liveClassesJoined: {
      type: Number,
      default: 0,
    },

    liveClassMinutes: {
      type: Number,
      default: 0,
    },

    // Reading
    chaptersCompleted: {
      type: Number,
      default: 0,
    },

    // Last activity
    lastSeen: Date,
  },
  {
    timestamps: true,
  }
);

studentUsageSchema.index(
  {
    studentId: 1,
    date: 1,
  },
  {
    unique: true,
  }
);

export default mongoose.model("StudentUsage", studentUsageSchema);
