import mongoose from 'mongoose';

const studyResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['note', 'pyq'], required: true },
    board: { type: String },
    className: { type: String, required: true }, // e.g. "10th"
    subject: { type: String, required: true },
    chapterName: { type: String, required: true },
    topic: { type: String },
    description: { type: String },
    resourceType: { type: String },
    visibility: { type: String, default: 'public' },
    status: { type: String, default: 'active' },
    pdfUrl: { type: String },
    thumbnailUrl: { type: String },
    fileUrl: { type: String },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.model('StudyResource', studyResourceSchema);
