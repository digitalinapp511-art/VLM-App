import mongoose from 'mongoose';

const parentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    fullName: { type: String, required: true },
    email: String,
    profilePhoto: String,
    city: String,
    state: String,
    preferredLanguage: { type: String, default: 'hindi' },
    linkedChildren: [{
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
      linkedAt: Date,
    }],
    controls: {
      dailyStudyHours: Number,
      appUsageLimit: Number,
      allowedTimings: { start: String, end: String },
      nightRestriction: { type: Boolean, default: false },
      featureControl: {
        chat: { type: Boolean, default: true },
        videoCall: { type: Boolean, default: true },
        liveClasses: { type: Boolean, default: true },
        mcq: { type: Boolean, default: true },
      },
      allowRedemption: { type: Boolean, default: true },
    },
    notificationSettings: {
      childInactive: { type: Boolean, default: true },
      lowPerformance: { type: Boolean, default: true },
      paymentReminder: { type: Boolean, default: true },
      examAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Parent', parentSchema);
