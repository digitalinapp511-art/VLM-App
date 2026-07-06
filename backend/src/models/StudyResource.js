import mongoose from 'mongoose';

const studyResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['note', 'pyq'], required: true },
    className: { type: String, required: true }, // e.g. "10th"
    subject: { type: String, required: true },
    chapterName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('StudyResource', studyResourceSchema);
