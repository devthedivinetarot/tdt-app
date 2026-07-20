// Plain Firebase configuration constants (no SDK imported here).
// The apiKey is a public client identifier (safe to ship) — protected by
// Firebase security rules + authorized domains, NOT a secret.
//
// Native uses @react-native-firebase (reads google-services.json); web uses the
// Firebase JS SDK with this config. See authBackend.native.js / authBackend.web.js.

export const firebaseConfig = {
  apiKey: 'AIzaSyDNhsRnGWeb8XbkKl9HUDIr_YbFsTso_EY',
  authDomain: 'the-divine-tarot.firebaseapp.com',
  projectId: 'the-divine-tarot',
  storageBucket: 'the-divine-tarot.firebasestorage.app',
  messagingSenderId: '491968377977',
  appId: '1:491968377977:web:2603b1a9273163c39050a8',
  measurementId: 'G-0P4MJC69MM',
};

// Google OAuth Web client ID (the "server" client used to mint the ID token).
// Public identifier, safe to ship.
export const GOOGLE_WEB_CLIENT_ID =
  '491968377977-oo00ivdvpl41vmbhmjig7kp2t6juu7je.apps.googleusercontent.com';
