import mongoose from 'mongoose';

/**
 * PaymentOrder — tracks every Razorpay order created in the system.
 * A record is created when the frontend requests an order, and updated
 * when the payment is verified.
 */
const paymentOrderSchema = new mongoose.Schema(
  {
    // Which user placed this order
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // What this payment is for
    type: {
      type: String,
      enum: ['wallet_recharge', 'subscription', 'trial'],
      required: true,
    },

    // Razorpay details
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },

    // Amount in ₹
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    // Payment status lifecycle
    status: {
      type: String,
      enum: ['created', 'paid', 'failed', 'refunded'],
      default: 'created',
    },

    // For subscription/trial orders: which plan was purchased
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      default: null,
    },

    // For wallet recharge orders: the credits payload to apply on success
    walletPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Extra metadata
    notes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model('PaymentOrder', paymentOrderSchema);
