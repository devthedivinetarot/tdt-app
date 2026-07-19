# Build the Real App & Test It on Your Phone

This turns your project into a real installable Android app (`.apk`) using **EAS
Build** (Expo's free cloud build service). No Android Studio, no Mac needed.
Plan for **20–30 minutes**, most of it waiting for the cloud build.

We start with **Android** because it's free and you can install the file directly.
iOS needs a paid Apple Developer account — covered at the end.

---

## Part A — One-time setup (≈10 min)

### 1. Create a free Expo account
Go to **https://expo.dev** → Sign up. Remember the username + password.

### 2. Install the build tool
Open a terminal (Command Prompt) and run:
```
npm install -g eas-cli
```
Check it worked:
```
eas --version
```

### 3. Install the app's packages
In your project folder:
```
cd D:\DivineTarotDev\Tdt-App
npm install
```
This pulls in everything, including haptics, device info, and location. Wait for it
to finish with no red `ERR!` lines. (If it errors, tell me the message.)

### 4. Log in to EAS
```
eas login
```
Enter your Expo username + password.

---

## Part B — Build the APK (≈15 min, mostly waiting)

### 5. Start the build
```
eas build --platform android --profile preview
```
- If it asks **"Would you like to create an EAS project?"** → **Yes**.
- If it asks **"Generate a new Android Keystore?"** → **Yes** (Expo stores it safely
  for you — you don't need to manage it).
- It uploads your project and builds in the cloud. You'll see a **build link**.

### 6. Wait, then download
When the build finishes (you'll get a link and a QR code):
- On your **Android phone**, open the build link (or scan the QR) and tap **Download**.
- Or download the `.apk` on your PC and transfer it to the phone.

### 7. Install it
On the phone, open the downloaded `.apk`. Android will ask to **allow installing from
this source** — allow it, then **Install**. The Divine Tarot icon appears in your app
drawer. 🎉

---

## Part C — Smoke test (what to check)

Open the app and walk through these. ✅ = should work now.

**Core experience ✅**
- Intro animation plays, then Home loads with the drifting starfield.
- **Card of the Day** — tap it, it flips; streak shows.
- Bottom nav — the gold highlight slides/pops; you feel a tiny buzz on tap (haptics).
- **Reading** → type a question → the cards **fan out**, swipe + tap to draw → they
  **flip** to reveal. Open the ⏱ history icon — your reading is saved.
- **Profile** → the **date / time / place wheel pickers**; add a **photo**; toggle
  the **daily reminders** and tap "Preview a reminder" (a notification appears).
- **Kundli** → fill the pickers → **Calculate Match** → the ₹ paywall shows.
- **Pull down** any screen → the gold "Consulting the stars…" refresh.

**Analytics ✅**
- After opening the app, refresh your Google Sheet — a new **Logs** row should appear,
  now filled with real **device** details (brand, model, Android version).
- In Profile → Privacy, turn on **Include my location** → it should ask permission →
  next log row includes your city.

**Payments ⚠️ REAL MONEY**
- Your Razorpay key is a **live** key, so a real payment will be charged.
  **Before testing payments**, either (a) switch to a **test** key in
  `src/lib/razorpay.js`, or (b) test with a tiny amount and refund it from the
  Razorpay dashboard.

**Sign-in (may need extra setup — see Part D)**
- **Phone OTP** and **Google** sign-in need a couple of Firebase settings that only
  apply to a real build. If they don't work yet, that's expected — do the other tests
  first and see Part D.

Tell me anything that looks wrong or crashes, and I'll fix it.

---

## Part D — Making sign-in work on the real build

These are Firebase/Google settings, not app-code changes.

**Phone OTP (SMS):**
1. Firebase Console → your **the-divine-tarot** project → **Authentication →
   Sign-in method** → enable **Phone**.
2. Firebase requires a paid plan for SMS — upgrade to the **Blaze** plan (pay-as-you-go;
   free tier covers low volume).
3. Add your app's **SHA-1** fingerprint (get it with `eas credentials` → Android →
   your build → copy SHA-1) into Firebase → Project settings → your Android app.

**Google sign-in:**
- Needs an **Android OAuth client** in Google Cloud tied to the same SHA-1. Once you
  have the SHA-1 from the step above, tell me and I'll walk you through adding it — it
  also fills in the empty `oauth_client` in `google-services.json`.

Until then, everything except sign-in works, so you can fully test the experience.

---

## Part E — iOS (later)
Installing on an iPhone requires an **Apple Developer account** ($99/year). Once you
have one:
```
eas build --platform ios --profile preview
```
and follow the prompts. Easiest distribution is **TestFlight**. We can tackle this
after Android looks good.

---

### If a build fails
Copy the error from the build log and send it to me. The most likely culprits and
quick fixes:
- `google-services.json` error → we can remove that line (not needed for the JS
  Firebase SDK we use).
- A package version warning → usually safe to ignore; if it blocks, I'll pin it.
