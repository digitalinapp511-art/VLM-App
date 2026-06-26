import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema(
  {
    mobile: String,
    email: String,
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['login', 'signup', 'verify'], default: 'login' },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Otp', otpSchema);
