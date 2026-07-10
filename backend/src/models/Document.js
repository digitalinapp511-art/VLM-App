import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    type: { 
      type: String, 
      enum: ['aadhaar', 'qualificationCert', 'experienceProof', 'resume', 'additional'], 
      required: true 
    },
    name: { type: String, required: true },
    url: { type: String, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Document', documentSchema);
