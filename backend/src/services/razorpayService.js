import Razorpay from 'razorpay';
import crypto from 'crypto';

// ── Initialize Razorpay Instance ──────────────────────────────────────────────
let razorpayInstance = null;

const getRazorpay = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set in environment variables');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

/**
 * Create a new Razorpay order.
 * @param {number} amountInRupees  - Amount in ₹ (will be converted to paise)
 * @param {string} receipt         - Unique receipt string (e.g., "wallet_userId_timestamp")
 * @param {string} [currency]      - Default: 'INR'
 * @param {object} [notes]         - Optional metadata to attach to order
 * @returns {Promise<object>}      - Razorpay order object
 */
export const createOrder = async (amountInRupees, receipt, currency = 'INR', notes = {}) => {
  const razorpay = getRazorpay();

  const options = {
    amount: Math.round(amountInRupees * 100), // Razorpay expects paise
    currency,
    receipt,
    notes,
  };

  const order = await razorpay.orders.create(options);
  return order;
};

/**
 * Verify a Razorpay payment signature.
 * The signature is HMAC-SHA256 of "{orderId}|{paymentId}" using the key secret.
 * @param {string} orderId    - Razorpay order_id
 * @param {string} paymentId  - Razorpay payment_id
 * @param {string} signature  - Razorpay razorpay_signature from client
 * @returns {boolean}         - true if signature is valid
 */
export const verifySignature = (orderId, paymentId, signature) => {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET not set');
  }

  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Fetch a payment by ID from Razorpay (useful for server-side verification or refunds).
 * @param {string} paymentId
 * @returns {Promise<object>}
 */
export const fetchPayment = async (paymentId) => {
  const razorpay = getRazorpay();
  return razorpay.payments.fetch(paymentId);
};
