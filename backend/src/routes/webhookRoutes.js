import { Router } from 'express';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';

const router = Router();

/**
 * POST /api/webhooks/razorpay
 * Public endpoint — verified by HMAC signature (no JWT auth needed).
 * Razorpay calls this for every subscription lifecycle event.
 *
 * IMPORTANT: This route relies on req.rawBody being set by the rawBodyMiddleware
 * in app.js (mounted BEFORE express.json()). Do not add express.json() here.
 */
router.post('/razorpay', handleRazorpayWebhook);

export default router;
