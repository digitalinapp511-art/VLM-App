import mongoose from 'mongoose';

const cashbackOfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },                // e.g. "Recharge ₹500, Get ₹100 Back!"
    description: { type: String, default: '' },             // shown below the title
    recommendedText: { type: String, default: '' },         // badge text e.g. "BEST VALUE", "100% CASHBACK"
    minRechargeAmount: { type: Number, required: true },    // student must recharge >= this (INR)
    cashbackAmount: { type: Number, required: true },       // fixed cashback credited (INR)
    cashbackPercent: { type: Number, default: 0 },          // OR percent-based (0 = use fixed amount)
    maxCashback: { type: Number, default: 0 },              // cap for percent-based (0 = no cap)
    isActive: { type: Boolean, default: true },
    validFrom: { type: Date, default: Date.now },
    validUntil: { type: Date, default: null },              // null = no expiry
    usageLimit: { type: Number, default: 0 },               // 0 = unlimited
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 0 },             // 0 = unlimited per user
    applicablePlans: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }], // empty = all plans
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('CashbackOffer', cashbackOfferSchema);
