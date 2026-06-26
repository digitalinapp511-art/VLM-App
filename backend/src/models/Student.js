import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    nickname: String,
    profilePhoto: String,
    class: { type: String, required: true },
    board: { type: String, required: true },
    medium: String,
    school: String,
    city: String,
    state: String,
    parentName: String,
    parentMobile: String,
    subjects: [String],
    weakSubjects: [String],
    learningGoals: String,
    preferredLanguage: { type: String, default: 'hindi' },
    favoriteTeachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' }],
    wallet: {
      totalPoints: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
      aiCredits: { type: Number, default: 10 },
      humanChatCredits: { type: Number, default: 5 },
      audioMinutes: { type: Number, default: 30 },
      videoMinutes: { type: Number, default: 15 },
      liveConnectMinutes: { type: Number, default: 0 },
    },
    subscription: {
      planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
      status: { type: String, enum: ['trial', 'active', 'expired', 'free', 'cancelled'], default: 'free' },
      trialEndsAt: Date,
      expiresAt: Date,
      autopayEnabled: { type: Boolean, default: false },
    },
    streak: { type: Number, default: 0 },
    lastActiveDate: Date,
    spinTimer: { type: Number, default: 0 },
    spinUnlocked: { type: Boolean, default: false },
    leaderboardRank: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    onboardingCompleted: { type: Boolean, default: false },
    linkedParents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
