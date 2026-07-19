import { useEffect } from 'react';
import { buildOptions } from '../lib/razorpay';

// Web Razorpay Checkout — loads checkout.js and opens the hosted modal.
// Renders nothing; Razorpay draws its own overlay.
function loadScript() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'));
    if (window.Razorpay) return resolve();
    const existing = document.getElementById('rzp-checkout-js');
    if (existing) { existing.addEventListener('load', () => resolve()); return; }
    const s = document.createElement('script');
    s.id = 'rzp-checkout-js';
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('failed to load Razorpay'));
    document.body.appendChild(s);
  });
}

export default function RazorpayCheckout({ visible, amount, description, prefill, onSuccess, onClose }) {
  useEffect(() => {
    if (!visible) return;
    let cancelled = false;
    (async () => {
      try {
        await loadScript();
        if (cancelled) return;
        const options = buildOptions({ amount, description, prefill });
        options.handler = (resp) => { onSuccess && onSuccess(resp.razorpay_payment_id); };
        options.modal = { ondismiss: () => { onClose && onClose(); } };
        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', () => { onClose && onClose(); });
        rzp.open();
      } catch (e) { onClose && onClose(); }
    })();
    return () => { cancelled = true; };
  }, [visible]); // eslint-disable-line
  return null;
}
