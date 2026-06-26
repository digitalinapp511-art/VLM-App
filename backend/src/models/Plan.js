import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    class: { type: String, required: true },
    duration: { type: String, enum: ['monthly', 'quarterly', 'yearly'], required: true },
    mrp: Number,
    price: Number,
    benefits: {
      aiCredits: Number,
      humanChatCredits: Number,
      audioMinutes: Number,
      videoMinutes: Number,
      liveClassesPerMonth: Number,
      doubtsPerDay: Number,
      subjects: [String],
    },
    trialDays: { type: Number, default: 3 },
    trialPrice: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
