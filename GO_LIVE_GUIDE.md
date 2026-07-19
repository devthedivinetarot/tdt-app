# The Divine Tarot — Go-Live & Backend Guide

*How to take the current Expo app from your machine to a live, published app on Google Play and the App Store — and what backend to build.*

---

## 0. The big picture

Right now the app is a **frontend** (Expo / React Native) with everything working as UI + demo logic (auth, profile, reminders, courses, kundli, reading bot). To go live you add three things:

1. **A backend** — for real login, saving user data, verifying payments, and talking to Teachable.
2. **Real integrations** — Google/OTP login, Razorpay, Teachable, push.
3. **Store builds & listings** — compiled apps + Play Console / App Store submissions.

**Recommended backend: Firebase.** It gives you Auth (Google + phone OTP), a database (Firestore), server code (Cloud Functions), file storage, and push (FCM) — all managed, so you don't run servers. This is the fastest path for a solo/small team. (Alternative: a custom Node/Express API on Render/Railway with Postgres — more control, more work. Use Firebase unless you have a reason not to.)

```
[ Mobile App ]  ──►  [ Firebase Auth ]        (Google + phone OTP)
      │              [ Firestore DB ]          (users, purchases, progress)
      │              [ Cloud Functions ]  ──►  Razorpay (verify payment)
      │                                   ──►  Teachable (auto-enroll, progress)
      │                                   ──►  Certificate PDF + email
      └────────────  [ FCM push ]              (server campaigns, optional)
```

---

## 1. Accounts & keys to create (only you can do these)

| Service | Why | Cost |
|---|---|---|
| **Firebase** (Google account) | Auth, database, functions, push | Free tier; **Blaze (pay-as-you-go)** needed for phone-OTP SMS and Cloud Functions — usually a few $/mo at low volume |
| **Google Cloud OAuth clients** | "Continue with Google" (auto-created with Firebase; you add iOS/Android/Web client IDs) | Free |
| **Razorpay** account + KYC | Payments (courses ₹, kundli ₹99) | Free to start; ~2% per transaction |
| **Teachable** plan with **API access** | Host courses, auto-enroll, progress, certificate | Your existing plan (confirm API tier) |
| **Apple Developer Program** | Publish on App Store | **US$99 / year** |
| **Google Play Console** | Publish on Play Store | **US$25 one-time** |
| **Expo (EAS)** account | Cloud builds (no Mac needed) | Free tier works; paid for faster builds |
| **Privacy policy URL** | Both stores require it | Free (generate one) |

> Prices above are the long-standing figures — confirm current amounts when you sign up.

---

## 2. Backend — what to build (Firebase)

Create one Firebase project ("the-divine-tarot"), then enable:

**a) Authentication**
- Enable **Google** and **Phone** sign-in providers.
- Phone auth sends real SMS OTP (needs Blaze plan). Google sign-in needs OAuth client IDs (Firebase generates them; you register the app's bundle IDs `com.thedivinetarot.app`).

**b) Firestore (database) — suggested collections**
```
users/{uid}          → { name, phone, email, provider, profile:{gender,dob,time,birthplace,marital,occupation}, createdAt }
purchases/{id}       → { uid, item, amount, razorpayPaymentId, status, createdAt }
enrollments/{id}     → { uid, courseId, teachableUserId, enrolledAt }
progress/{uid}/{courseId} → { percent, completedAt }
certificates/{id}    → { uid, courseId, url, issuedAt }
pushTokens/{uid}     → { token, platform }
```

**c) Cloud Functions (server logic)** — the important ones:
1. `createRazorpayOrder` — app asks for an order; function creates it via Razorpay API and returns the order id.
2. `razorpayWebhook` — Razorpay calls this after payment; function **verifies the signature**, marks the purchase paid, and triggers enrollment/unlock. (Never trust the client that "payment succeeded" — always verify server-side.)
3. `enrollInTeachable` — on paid course, call Teachable API to enroll the buyer's Gmail.
4. `teachableProgressWebhook` — Teachable notifies on lesson completion; store progress in Firestore.
5. `issueCertificate` — on 100% completion, render a themed PDF, upload to Storage, email it, save the URL.

**d) Storage** — for certificate PDFs and any uploads.

**e) FCM** — for server-sent push campaigns later (the daily reminders you already have are on-device and need no backend).

---

## 3. Making login real (code changes I'll make)

Your app already has the full login UI and two stubbed calls in `src/context/AuthContext.js`: `signInWithGoogle()` and `verifyOTP()`. To go live:

- **Add Firebase to the app:** `npx expo install firebase` (JS SDK) — or `@react-native-firebase/*` for native. For Expo-managed, the Firebase JS SDK + `expo-auth-session` is the common route.
- **Google:** use `expo-auth-session/providers/google` with the iOS/Android/Web client IDs from Firebase → sign the user into Firebase → read name/email.
- **Phone OTP:** Firebase Phone Auth. In Expo-managed you use `expo-firebase-recaptcha` for the verifier; on a native build `@react-native-firebase/auth` handles OTP directly. I'll wire `startPhoneOTP` → `signInWithPhoneNumber`, and `verifyOTP` → `confirm(code)`.
- On success, create/update the `users/{uid}` doc in Firestore and save the profile form there instead of only on-device.

You give me: the Firebase config object + the 3 Google OAuth client IDs. I change ~2 files.

---

## 4. Payments — the store-policy reality (important)

This shapes everything, so decide it before building payments:

- **Apple App Store:** digital goods (course access, the ₹99 kundli unlock, any in-app reading purchase) **must** use Apple In-App Purchase (15–30%). Razorpay for digital content = rejection on iOS.
- **Google Play (India):** you may use Razorpay via "alternative billing," but Google still takes a reduced service fee.
- **Where Razorpay keeps 100%:** a real **live 1:1 counsel** (a human service), physical items, and anything sold on your **website**.

**Recommended split:**
- Sell **courses and the kundli ₹99 unlock on the web / via Razorpay** and simply reflect ownership in the app (Google-friendly; on iOS keep it subtle — Apple restricts in-app links to external payment).
- Use **Apple IAP + Google Play Billing** for anything you sell *inside* the app as digital content.
- Use **Razorpay** for live counsel / physical goods.

Payment flow (Razorpay, web/service items): app → `createRazorpayOrder` → open Razorpay Checkout (`react-native-razorpay` on native) → Razorpay calls `razorpayWebhook` → server verifies → unlocks + enrolls. The kundli "Pay ₹99" and course "Enrol" buttons then point at this real flow instead of the site.

---

## 5. Teachable — enroll, progress, certificate

1. **Migrate the 5 courses onto Teachable** (they're on `.co.in` today).
2. After a **paid** course webhook, `enrollInTeachable` calls the Teachable API to enroll the buyer's **Gmail** (Teachable uses passwordless OTP login, so they just sign in with that Gmail).
3. **Progress:** subscribe to Teachable webhooks / poll the API → store `progress` in Firestore → show in the app and an admin view.
4. **Certificate:** on 100% completion, `issueCertificate` renders a **themed PDF** (your violet/gold brand), stores it, emails it, and exposes an in-app download.

You give me: Teachable API key + the course IDs. I write the functions.

---

## 6. Notifications

- **Daily reminders:** already done (on-device, local — no backend needed).
- **Server campaigns / WhatsApp / email** (the Zomato/Astro-style pushes at scale, personalized): store FCM tokens (`pushTokens`), send via a scheduled Cloud Function; WhatsApp needs the **WhatsApp Business API** (Interakt/Gupshup) with template approval + opt-in; email needs an ESP (e.g., Klaviyo). This is a later phase.

---

## 7. Build & publish (step by step)

**One-time setup**
```
npm install -g eas-cli
eas login
eas build:configure        # creates eas.json
```
Confirm `app.json` has your bundle IDs (already set: `com.thedivinetarot.app`), version, icon, splash (done).

**Android**
```
eas build -p android --profile production     # produces an .aab in the cloud
```
- In **Play Console**: create the app → upload the `.aab` → fill listing (title, description, screenshots), **Data safety** form, content rating, and **Privacy policy URL**.
- Release to **Internal testing** first (test on your device), then **Production**.

**iOS** (needs Apple Developer account; no Mac required with EAS)
```
eas build -p ios --profile production
eas submit -p ios
```
- In **App Store Connect**: create the app, add screenshots, description, privacy details, then submit for review.

**Assets you still need for the listings:** 3–8 screenshots per platform, a short + full description, a feature graphic (Android), and a hosted **privacy policy** + **account-deletion** method (both stores require account deletion for apps with login).

**Review time:** Google usually hours–2 days; Apple usually 1–3 days.

---

## 8. Don't-get-rejected checklist

- ✅ **Privacy policy** URL + in-app **account deletion** (required — you have login).
- ✅ On iOS, don't put buttons/links pushing users to external web payment for digital goods.
- ✅ Justify notification permission in the listing.
- ✅ Fill Google **Data safety** and Apple **App Privacy** honestly (you collect name, DOB, phone).
- ✅ Working demo credentials for reviewers if any content is gated.

---

## 9. Recommended order (and what I need from you at each step)

| Phase | What | You provide | I do |
|---|---|---|---|
| **A. Auth live** | Firebase Auth (Google + OTP) | Firebase config + Google client IDs | Replace the 2 stubs; save users to Firestore |
| **B. Profiles/data** | Firestore read/write | (same project) | Wire profile save/load, purchases model |
| **C. Payments** | Razorpay + verify | Razorpay keys + webhook secret; payment strategy confirm | Cloud Functions + in-app checkout |
| **D. Courses** | Teachable enroll/progress/cert | Teachable API key + course IDs | Functions + admin/progress + certificate PDF |
| **E. Ship** | EAS build + store submit | Apple ($99) + Play ($25) accounts, screenshots, privacy URL | Configure EAS, build, guide submission |

**Rough timeline:** A–B ~1 week, C ~1 week, D ~1–2 weeks, E ~1 week (plus review). ~4–6 weeks to a first public release with one focused developer.

---

## 10. Your immediate next 3 steps

1. **Create the Firebase project** and enable Google + Phone auth. Send me the **Firebase config** and **Google OAuth client IDs**.
2. **Start Razorpay KYC** (it takes a few days) and **confirm your Teachable plan includes API access**.
3. **Register** the Apple Developer ($99/yr) and Google Play ($25) accounts so nothing blocks the build later.

Once you send the Firebase config + Google client IDs, I'll make **Phase A (real login)** live first.
