import mongoose from 'mongoose';
import { TEACHER_STATUS } from '../config/constants.js';


const teacherSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vlmTeacherId: { type: String, unique: true, sparse: true, index: true },
    firstName: { type: String, required: true },
    middleName: String,
    lastName: { type: String, required: true },
    profilePhoto: String,
    publicProfilePhoto: String,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    dateOfBirth: Date,
    bio: String,
    teachingStyle: String,
    address: String,
    state: String,
    city: String,
    pincode: String,
    email: String,
    subjects: [String],
    classes: [String],
    boards: [String],
    languages: [String],
    qualification: {
      highestQualification: String,
      instituteName: String,
      passingYear: Number,
      hasBEd: { type: Boolean, default: false },
      teachingCertification: String,
      additionalCertifications: [String],
    },
    experience: {
      totalYears: Number,
      isFresher: { type: Boolean, default: false },
      teachingModes: [String],
      experienceTypes: [String],
      summary: String,
      resumeUrl: String,
    },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
      upiId: String,
      isVerified: { type: Boolean, default: false },
    },
    verifiedClasses: [String], // Array of verified grade levels e.g. ['9', '10', '11', '12']
    pendingClassUpgrade: {
      requestedClasses: [String],
      status: { type: String, enum: ['none', 'pending_interview', 'approved', 'rejected'], default: 'none' },
      requestedAt: Date,
      rejectionReason: String,
    },
    documentsSubmitted: { type: Boolean, default: false },
    wallet: {
      totalPoints: { type: Number, default: 0 },
      withdrawableBalance: { type: Number, default: 0 },
      pendingConversion: { type: Number, default: 0 },
    },
    demoVideo: {
      url: String,
      duration: Number,
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    },
    applicationStatus: {
      type: String,
      enum: Object.values(TEACHER_STATUS),
      default: TEACHER_STATUS.DRAFT,
    },
    rejectionReason: String,
    reapplyAfter: Date,
    onboardingStep: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false },
    adminPriority: { type: Number, default: 0 },
    availabilityStatus: {
      type: String,
      enum: ['online', 'offline', 'busy'],
      default: 'offline',
    },
    manuallySetOffline: { type: Boolean, default: false },

    interview: {
      scheduledAt: Date,
      slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Interview' },
      status: String,
      notes: String,
      recordingUrl: String,
      agoraChannelName: String,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

teacherSchema.virtual('fullName').get(function () {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ');
});

export default mongoose.model('Teacher', teacherSchema);
