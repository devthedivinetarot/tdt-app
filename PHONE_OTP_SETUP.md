# Phone OTP (SMS Login) — Setup

The app now uses **@react-native-firebase** on the phone, which does real SMS OTP
natively (no reСAPTCHA, doesn't break the build). A few Firebase settings are needed.

## 1. Enable the Phone provider
1. **console.firebase.google.com** → **the-divine-tarot** project.
2. **Build → Authentication → Sign-in method** → **Phone** → **Enable** → Save.

## 2. Upgrade to the Blaze plan (required for SMS)
Firebase only sends verification SMS on the **Blaze** (pay-as-you-go) plan.
- Left sidebar → **Upgrade** → choose **Blaze**. It has a free monthly allowance;
  low volume is effectively free, and you can set a budget alert.

## 3. Add your SHA-1 **and** SHA-256 fingerprints
Android phone auth verifies your app via Play Integrity, which needs both fingerprints.
1. Get them: `eas credentials` → Android → Keystore (copy **SHA-1** and **SHA-256**).
2. Firebase → **Project settings → Your apps → Android app** → **Add fingerprint** →
   add the **SHA-256** (you already added SHA-1 for Google) → Save.
3. **Re-download `google-services.json`** and replace it in the project.

## 4. Rebuild
```
npm install
eas build --platform android --profile preview
```
Install the new APK. On the Profile tab, enter a 10-digit number → **OTP bhejo** →
you'll get an SMS → enter the 6-digit code → signed in. 🎉

## Notes
- **Testing without real SMS:** In Firebase → Authentication → Sign-in method → Phone →
  **"Phone numbers for testing"**, add a fake number + code (e.g. `+91 9999999999` →
  `123456`). Then that number "receives" that code without a real SMS — great for testing.
- **Web preview:** phone OTP is intentionally disabled in the browser (shows a hint to
  use Google). Real SMS works on the phone build. Google sign-in works on both.
- **iOS later:** iOS builds will also need the `expo-build-properties` plugin
  (`useFrameworks: static`) for react-native-firebase — we'll add that when you build
  for iPhone.
