// ---------------------------------------------------------------------------
// Razorpay config. Paste your PUBLIC Key ID below (starts with rzp_test_ for
// testing or rzp_live_ for real money). This is safe to ship — it's a public
// identifier. NEVER put your Key SECRET in the app.
//
// Get it: Razorpay Dashboard → Settings → API Keys → Generate/Copy Key Id.
// Setup steps are in PAYMENTS_SETUP.md.
// ---------------------------------------------------------------------------
export const RAZORPAY_KEY_ID = 'rzp_live_SzPh46jW9yjpV4'; // e.g. 'rzp_test_XXXXXXXXXXXXXX'

// Prices in rupees. Change freely.
export const PRICES = {
  subscription: 199, // 30-day full access to the reading bot
  kundli: 99,        // Kundli Milan report
};

export const BRAND = { name: 'The Divine Tarot', color: '#e9c46a' };

// OPTIONAL secure backend: paste the deployed Google Apps Script Web App URL
// (from RAZORPAY_WEBHOOK_SETUP.md). When set, the app creates a verified Order
// and confirms the payment signature server-side before unlocking. Your Key
// SECRET lives ONLY in that script — never in the app. Empty = client-only
// flow (fine for testing, not tamper-proof).
export const PAYMENTS_ENDPOINT = ''; // e.g. 'https://script.google.com/macros/s/YYYY/exec'

export const isRazorpayConfigured = () => /^rzp_(test|live)_/.test(RAZORPAY_KEY_ID);
export const serverVerifyEnabled = () => !!PAYMENTS_ENDPOINT;

// Builds the options object Razorpay Checkout expects. When an `orderId` is
// supplied (secure flow) the amount comes from the Order, so it's omitted here.
export function buildOptions({ amount, description, prefill, orderId }) {
  const o = {
    key: RAZORPAY_KEY_ID,
    currency: 'INR',
    name: BRAND.name,
    description: description || '',
    prefill: {
      name: (prefill && prefill.name) || '',
      email: (prefill && prefill.email) || '',
      contact: (prefill && prefill.contact) || '',
    },
    theme: { color: BRAND.color },
  };
  if (orderId) o.order_id = orderId;
  else o.amount = Math.round(Number(amount) * 100);
  return o;
}
