# Backend Setup — A Beginner's Guide

*Written for someone who has never built an app. You will not write a single line of code. Your job is to **create accounts and copy a few keys**. I do the wiring.*

---

## First: what "backend" even means here

Right now your app keeps everything **on the phone**. If you uninstall it, your profile is gone. There's no real login and no real payment.

A "backend" is just an **online service** that remembers things for you:

| What you want | Why it needs a backend |
|---|---|
| Real login (Google / OTP) | Someone must send the SMS and verify it |
| Profile saved across phones | Data must live online, not on one device |
| Taking money | Payment must be confirmed by a trusted server |
| Auto-enrol in a course after payment | Something must talk to Teachable for you |

You don't build this. You **sign up** for ready-made services and give me the keys.

---

## Your job vs my job

| Step | You do | I do |
|---|---|---|
| Firebase (login + database) | Create the project, click a few toggles, copy config | Wire it into the app |
| Razorpay (payments) | Sign up + KYC, create payment links | Connect them & verify payments |
| Teachable (courses) | Confirm plan, generate API key | Auto-enrol buyers, progress, certificate |
| Store accounts | Register Apple + Google accounts | Build & prepare the submission |

---

## STEP 1 — Firebase (login + saving data) · ~20 minutes

Firebase is Google's free/cheap service that handles logins and stores data.

1. Go to **console.firebase.google.com** → sign in with your Google account.
2. Click **Add project** → name it `The Divine Tarot` → **Continue** → (you can turn Analytics off) → **Create project**.
3. In the left menu: **Build → Authentication → Get started**.
4. Open the **Sign-in method** tab:
   - Click **Google** → toggle **Enable** → pick your support email → **Save**.
   - Click **Phone** → toggle **Enable** → **Save**.
5. **Phone OTP needs a paid plan** (Google charges per SMS). Click the ⚙ gear (top-left) → **Usage and billing** → **Details & settings** → **Modify plan** → choose **Blaze (pay as you go)** → add a card.
   > At your early scale this is usually a few hundred rupees a month. There's a free allowance; SMS is charged per message.
6. Left menu: **Build → Firestore Database → Create database** → choose **Start in production mode** → pick region **asia-south1 (Mumbai)** → **Enable**.
7. Now get the keys. Click ⚙ → **Project settings** → **General** tab → scroll to **Your apps**:
   - Click the **web icon `</>`** → nickname `TDT Web` → **Register app** → **copy the whole `firebaseConfig` block** you see.
   - Click **Add app → Android** → package name: `com.thedivinetarot.app` → register → **download `google-services.json`**.
   - Click **Add app → iOS** → bundle ID: `com.thedivinetarot.app` → register → **download `GoogleService-Info.plist`**.
8. Put those 2 downloaded files into your project folder `D:\DivineTarotDev\Tdt-App\` and tell me — plus paste the `firebaseConfig` block.

✅ **After this step I can turn on real Google login + real SMS OTP.**

---

## STEP 2 — Razorpay (taking payments) · start early, KYC takes days

1. Go to **razorpay.com** → **Sign Up** → enter business details.
2. Complete **KYC** (PAN, bank account, address). This is reviewed and can take **2–5 working days** — start it now.
3. **The easy path (no code):** Dashboard → **Payment Links** → **Create payment link**:
   - Amount `99`, title `Kundli Milan Report` → Create → **copy the link**.
   - Repeat for each course (₹15,000 Beginner, ₹25,000 Advanced, ₹10,000 others).
   - Send me those links — I'll drop them into the app's buttons and they work immediately.
4. **For automatic subscriptions later:** Dashboard → **Settings → API Keys** → **Generate Key** → you'll get a **Key ID** and a **Key Secret**.

> 🔒 **Security:** The **Key ID** is public and safe to share. The **Key Secret** is like a password — **never** put it in the app, never paste it in a screenshot or chat. When we get to that step, I'll give you a single command to store it safely on the server yourself.

---

## STEP 3 — Teachable (courses) · ~10 minutes

1. Log in to Teachable → **Settings** → check your plan includes **API access** (upgrade if not).
2. Generate an **API key** and copy it.
3. Get the 5 **course IDs** (visible in each course's URL in the admin).
4. Send me the API key + course IDs.

✅ **Then:** after someone pays, they're auto-enrolled with their Gmail, their progress is tracked, and a certificate is generated on completion.

---

## STEP 4 — Notifications

Nothing to do. The **daily reminders already work** on the phone with no backend. Server-driven campaigns (personalised push, WhatsApp, email) are a later, optional phase.

---

## STEP 5 — Store accounts (needed to publish)

| Account | Cost | Why |
|---|---|---|
| **Google Play Console** | US$25 one-time | Publish on Android |
| **Apple Developer Program** | US$99 / year | Publish on iPhone (also needed to install on your own iPhone) |

Also required by both stores: a **privacy policy web page** and a way for users to **delete their account** (I'll build the delete button; you host the policy page).

---

## What to send me (checklist)

- [ ] `firebaseConfig` block (from Step 1.7)
- [ ] `google-services.json` + `GoogleService-Info.plist` files
- [ ] Razorpay **Payment Links** (₹99 kundli + the 5 courses)
- [ ] Razorpay **Key ID** (NOT the secret)
- [ ] Teachable **API key** + 5 course IDs

Send them as you get them — I'll wire each piece as it arrives. Firebase first unlocks the most.

---

## Rough costs

| Item | Cost |
|---|---|
| Firebase Blaze | Usually a few hundred ₹/month at small scale + per-SMS charge |
| Razorpay | ~2% per transaction |
| Google Play | US$25 once |
| Apple Developer | US$99 / year |

---

## Suggested order (least waiting)

1. **Today:** Start Razorpay KYC (it's the slowest) + register Google Play.
2. **Today:** Do Firebase Step 1 (20 min) → send me the config → real login works.
3. **This week:** Teachable API key → course auto-enrol.
4. **Then:** Payment links → live payments.
5. **Finally:** Apple account → iOS build → submit both stores.

---

## If this feels like too much

You don't have to do it all at once. **The app already works today** without any backend: readings with the card picker, courses browsing, kundli form, daily reminders, and a local profile. You can publish that first and add login/payments in an update.
