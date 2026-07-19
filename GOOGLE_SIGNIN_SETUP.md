# Google Sign-In on the Real App — Setup

The app code is ready. Native Google Sign-In needs Google to **trust your app**,
which means registering your app's signing fingerprint (SHA-1) with Firebase. Do
this once (~10 min), then rebuild.

## 1. Get your app's SHA-1 fingerprint
In your project folder:
```
cd D:\DivineTarotDev\Tdt-App
eas credentials
```
- Choose **Android** → your project → **Keystore: Manage everything...** →
  **Download** or **View** the keystore.
- Copy the **SHA-1 Fingerprint** (looks like `AB:CD:12:...`).

(You can also find it on the build's page on expo.dev → the build → "Credentials".)

## 2. Add the SHA-1 to Firebase
1. **console.firebase.google.com** → your **the-divine-tarot** project.
2. Gear icon → **Project settings** → scroll to **Your apps** → the **Android** app
   (`com.thedivinetarot.app`).
   - If there's no Android app yet, click **Add app → Android**, use package name
     `com.thedivinetarot.app`, and register it.
3. Click **Add fingerprint** → paste the **SHA-1** → **Save**.

## 3. Enable Google sign-in in Firebase
1. **Build → Authentication → Sign-in method**.
2. Click **Google** → **Enable** → pick a support email → **Save**.

## 4. Download the updated google-services.json
1. Back in **Project settings → Your apps → Android app**, click
   **google-services.json** to download it.
2. Replace the file in your project:
   `D:\DivineTarotDev\Tdt-App\google-services.json`
   (This new copy now contains the OAuth client IDs the app needs.)

## 5. Rebuild
```
npm install
eas build --platform android --profile preview
```
Install the new APK. **Continue with Google** should now work — it opens the native
Google account chooser and signs you in.

## Notes
- The **Web client ID** already in the app (`src/firebase.js`) is correct and stays —
  Google uses it as the "server" client to issue the sign-in token. You only needed to
  add the **Android** side (the SHA-1), which Firebase wires up automatically.
- If you later publish to the Play Store, Google Play re-signs your app, so you'll add
  **one more SHA-1** (from Play Console → Setup → App signing) to Firebase the same way.
- iOS Google sign-in needs an extra step (an `iosUrlScheme`); we'll do that when you
  build for iPhone.

## If it still fails after this
Tell me the exact error text. Common ones:
- *"DEVELOPER_ERROR"* → SHA-1 not added or google-services.json not replaced/rebuilt.
- *"Sign in cancelled"* → you closed the chooser; just retry.
