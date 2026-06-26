import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema(
  {
    referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    referrerRole: { type: String, enum: ['student', 'teacher', 'parent'] },
    referralType: { type: String, enum: ['student', 'teacher'], required: true },
    referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    referralCode: String,
    status: {
      type: String,
      enum: ['clicked', 'registered', 'verified', 'eligible', 'rewarded', 'invalid', 'pending'],
      default: 'clicked',
    },
    rewardPoints: { type: Number, default: 0 },
    milestone: String,
    invalidReason: String,
  },
  { timestamps: true }
);

export default mongoose.model('Referral', referralSchema);
