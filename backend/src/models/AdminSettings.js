import mongoose from 'mongoose';

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: mongoose.Schema.Types.Mixed,
    category: String,
    description: String,
  },
  { timestamps: true }
);

export default mongoose.model('AdminSettings', adminSettingsSchema);
