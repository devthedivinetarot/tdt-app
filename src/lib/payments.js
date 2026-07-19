import { PAYMENTS_ENDPOINT } from './razorpay';

// Talks to the Google Apps Script backend (RAZORPAY_WEBHOOK_SETUP.md).
// Server-side it creates Orders and verifies signatures using the Key Secret,
// which never touches the app.

async function callBackend(action, data) {
  const res = await fetch(PAYMENTS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // simple request → no CORS preflight
    body: JSON.stringify({ action, ...data }),
  });
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { return null; }
}

// Returns a Razorpay order_id (string) or null on failure.
export async function createOrder({ amount, notes }) {
  if (!PAYMENTS_ENDPOINT) return null;
  try {
    const r = await callBackend('create_order', {
      amount: Math.round(Number(amount) * 100), // paise
      currency: 'INR',
      notes: notes || {},
    });
    return r && r.order_id ? r.order_id : null;
  } catch (e) { return null; }
}

// Returns true only if the backend confirms the signature is authentic.
export async function verifyPayment({ orderId, paymentId, signature }) {
  if (!PAYMENTS_ENDPOINT) return false;
  try {
    const r = await callBackend('verify_payment', {
      order_id: orderId, payment_id: paymentId, signature,
    });
    return !!(r && r.valid);
  } catch (e) { return false; }
}
