import mongoose from 'mongoose';

const payoutRecordSchema = new mongoose.Schema(
  {
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    payoutPeriodStart: Date,
    payoutPeriodEnd: Date,
    bankSnapshot: {
      accountHolder: String,
      accountNumber: String,
      ifsc: String,
      bankName: String,
      upiId: String,
    },
    transactionReference: { type: String, required: true }, // UTR / Bank Ref Number
    status: {
      type: String,
      enum: ['PROCESSING', 'PAID', 'FAILED', 'CANCELLED'],
      default: 'PAID',
    },
    paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin / Sub-admin ID
    paidAt: { type: Date, default: Date.now },
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model('PayoutRecord', payoutRecordSchema);
