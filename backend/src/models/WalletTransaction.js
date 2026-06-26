import mongoose from 'mongoose';
import { EARNING_TYPES } from '../config/constants.js';

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'teacher'] },
    type: { type: String, enum: ['credit', 'debit'] },
    earningType: { type: String, enum: Object.values(EARNING_TYPES) },
    points: { type: Number, required: true },
    inrAmount: Number,
    description: String,
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    status: { type: String, enum: ['pending', 'eligible', 'credited', 'reversed'], default: 'credited' },
    isAdminAdjustment: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('WalletTransaction', walletTransactionSchema);
