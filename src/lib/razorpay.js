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
  subscription: 299, // 30-day full access to the reading bot
  kundli: 99,        // Kundli Milan report
};

export const BRAND = { name: 'The Divine Tarot', color: '#e9c46a' };

export const isRazorpayConfigured = () => /^rzp_(test|live)_/.test(RAZORPAY_KEY_ID);

// Builds the options object Razorpay Checkout expects (amount in paise).
export function buildOptions({ amount, description, prefill }) {
  return {
    key: RAZORPAY_KEY_ID,
    amount: Math.round(Number(amount) * 100),
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
}
