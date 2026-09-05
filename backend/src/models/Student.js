import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vlmStudentId: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, sparse: true },
    mobile: { type: String, sparse: true },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: String,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    nickname: String,
    profilePhoto: String,
    publicProfilePhoto: String,
    class: { type: String, required: true },
    stream: { type: String, default: '' },
    board: { type: String, required: true },
    medium: { type: String, default: 'English' },
    school: String,
    city: String,
    state: String,
    pincode: String,
    parentName: String,
    parentMobile: String,
    subjects: { type: [String], default: ['Math', 'Science', 'English', 'Social Science', 'Hindi'] },
    weakSubjects: { type: [String], default: ['Social Science'] },
    learningGoals: { type: String, default: 'Improve score in final exams' },
    preferredLanguage: { type: String, default: 'english' },
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
      razorpaySubscriptionId: { type: String, default: null },
      // Permanent flag — once true, never reset. Prevents duplicate ₹1 trials.
      hasUsedTrial: { type: Boolean, default: false },
      // Set when user cancels; if cancelAtPeriodEnd=true, access continues until expiresAt
      cancelledAt: { type: Date, default: null },
      cancelAtPeriodEnd: { type: Boolean, default: false },
      // Updated by webhook on every successful autopay charge
      lastRenewalAt: { type: Date, default: null },
    },
    streak: { type: Number, default: 0 },
    lastActiveDate: Date,
    spinTimer: { type: Number, default: 0 },
    spinUnlocked: { type: Boolean, default: false },
    lastSpinDate: Date,
    lastSpinActiveMinutes: { type: Number, default: 0 },
    lastSpinActiveSeconds: { type: Number, default: 0 },
    studentReferralCode: { type: String, unique: true, sparse: true },
    teacherReferralCode: { type: String, unique: true, sparse: true },
    leaderboardRank: { type: Number, default: 0 },
    totalPoints: { type: Number, default: 0 },
    mcqPoints: { type: Number, default: 0 },
    subjectPerformance: [{
      subject: { type: String },
      totalAttempted: { type: Number, default: 0 },
      totalCorrect: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },       // recomputed each submit (0-100)
      lastUpdated: { type: Date },
    }],
    bio: { type: String, default: '' },
    onboardingCompleted: { type: Boolean, default: false },
    linkedParents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parent' }],
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

studentSchema.virtual('fullName').get(function() {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
});

export default mongoose.model('Student', studentSchema);



