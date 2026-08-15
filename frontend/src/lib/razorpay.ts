/**
 * razorpay.ts — Frontend utilities for Razorpay Checkout
 *
 * Usage:
 *   const loaded = await loadRazorpayScript();
 *   if (!loaded) { toast.error("Payment SDK failed to load"); return; }
 *
 *   const result = await openRazorpayCheckout({ orderId, amount, currency, keyId, ... });
 *   if (result.success) { await verifyPayment(result); }
 */

declare global {
  interface Window {
    Razorpay: any;
  }
}

// ── Load the Razorpay checkout.js SDK from CDN ────────────────────────────────
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

export interface RazorpayCheckoutOptions {
  orderId: string;
  amount: number;        // in paise (e.g., 50000 = ₹500)
  currency?: string;     // default 'INR'
  keyId: string;
  name?: string;
  description?: string;
  prefillName?: string;
  prefillEmail?: string;
  prefillContact?: string;
  themeColor?: string;
  webview_intent?: boolean;
}

export interface RazorpayPaymentResult {
  success: true;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentError {
  success: false;
  error: {
    code: string;
    description: string;
    reason: string;
  };
}

// ── Open the Razorpay Checkout modal ─────────────────────────────────────────
export const openRazorpayCheckout = (
  options: RazorpayCheckoutOptions
): Promise<RazorpayPaymentResult | RazorpayPaymentError> => {
  return new Promise((resolve) => {
    const rzpOptions = {
      key: options.keyId,
      amount: options.amount,
      currency: options.currency || "INR",
      name: options.name || "VLM Academy",
      description: options.description || "Payment",
      order_id: options.orderId,
      image: "https://pub-316f9dd6bea04824be0dafcc43132ee1.r2.dev/vlm-logo.png",
      webview_intent: options.webview_intent !== undefined ? options.webview_intent : true,
      theme: {
        color: options.themeColor || "#1e3a8e",
      },
      prefill: {
        name: options.prefillName || "",
        email: options.prefillEmail || "",
        contact: options.prefillContact || "",
      },
      handler: (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        resolve({
          success: true,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => {
          resolve({
            success: false,
            error: {
              code: "PAYMENT_CANCELLED",
              description: "Payment was cancelled by the user.",
              reason: "user_cancelled",
            },
          });
        },
      },
    };

    const rzp = new window.Razorpay(rzpOptions);

    rzp.on(
      "payment.failed",
      (response: { error: { code: string; description: string; reason: string } }) => {
        resolve({
          success: false,
          error: {
            code: response.error.code,
            description: response.error.description,
            reason: response.error.reason,
          },
        });
      }
    );

    rzp.open();
  });
};
