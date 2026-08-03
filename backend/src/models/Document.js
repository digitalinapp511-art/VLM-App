import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
}, { _id: false });

const documentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true, unique: true },
    aadhaar: fileSchema,
    qualificationCert: fileSchema,
    experienceProof: fileSchema,
    resume: fileSchema,
    additional: [fileSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Document', documentSchema);
