# Razorpay Payments — Setup (5 minutes)

The app has an in-app Razorpay checkout wired into two places:
- **Reading subscription** (₹299 / 30-day full access) — the "Subscribe" screen.
- **Kundli Milan report** (₹99) — the "Pay & Reveal Result" button.

It needs only your **public Key ID** — no backend, no secret in the app.

## 1. Get your Key ID
1. Log in at **dashboard.razorpay.com**.
2. **Settings → API Keys**.
3. Start in **Test Mode** (toggle top-right) → **Generate Test Key**.
4. Copy the **Key Id** — it looks like `rzp_test_ABC123...`.
   (Copy the Key *Secret* too and keep it safe — but **do NOT** put the secret in the app.)

## 2. Put it in the app
Open `src/lib/razorpay.js` and paste it:
```javascript
export const RAZORPAY_KEY_ID = 'rzp_test_ABC123...';
```
You can also change the prices there:
```javascript
export const PRICES = { subscription: 299, kundli: 99 };
```
Save. The buttons now open a real Razorpay checkout.

## 3. Test it
Use Razorpay's test card: **4111 1111 1111 1111**, any future expiry, any CVV, any name.
Complete the payment → the app unlocks (premium granted / Kundli marked paid).

## 4. Go live (when ready)
1. Complete Razorpay **KYC / account activation**.
2. Switch the dashboard to **Live Mode**, generate a **Live Key**, and replace the
   Key ID with the `rzp_live_...` value.
3. On the Razorpay dashboard set payments to **auto-capture** (Settings → Payments) so
   money is captured automatically.

## Important — security note (read this)
This is a **no-backend** integration: the app unlocks as soon as Razorpay's checkout
reports success on the device. That's perfect to launch, but a tech-savvy user could
fake the "success" locally. When you're ready to harden it, the standard fix is:
- Create a small **webhook** (Google Apps Script or a cloud function) that Razorpay
  calls on every real payment, and verify the signature there before granting access.

I can build that webhook + verification for you whenever you want — just ask.

## What's charged where
| Where | Amount | On success |
|-------|--------|-----------|
| Reading "Subscribe" | ₹299 | 30-day unlimited readings |
| Kundli "Pay & Reveal" | ₹99 | Report marked paid (emailed report step is manual/your site) |

Until you paste a Key ID, both buttons keep their current safe fallback (subscription
grants a 30-day trial; Kundli opens your website).
