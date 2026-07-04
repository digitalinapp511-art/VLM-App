import mongoose from 'mongoose';

const parentChildRequestSchema = new mongoose.Schema(
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isQrScan: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model('ParentChildRequest', parentChildRequestSchema);
