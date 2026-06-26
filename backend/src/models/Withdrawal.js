import mongoose from 'mongoose';
import { WITHDRAWAL_STATUS } from '../config/constants.js';

const withdrawalSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    amount: { type: Number, required: true },
    points: { type: Number, required: true },
    netAmount: Number,
    tds: Number,
    commission: Number,
    status: { type: String, enum: Object.values(WITHDRAWAL_STATUS), default: WITHDRAWAL_STATUS.PENDING },
    mode: { type: String, enum: ['manual', 'auto', 'hybrid'], default: 'manual' },
    bankDetails: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
    },
    payoutReference: String,
    rejectionReason: String,
    processedAt: Date,
    retryCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Withdrawal', withdrawalSchema);
