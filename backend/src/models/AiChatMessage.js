import mongoose from 'mongoose';

const aiChatMessageSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    image: String,
    tokensUsed: { type: Number, default: 0 },
    creditsDeducted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('AiChatMessage', aiChatMessageSchema);
