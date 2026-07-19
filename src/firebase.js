// Firebase foundation for The Divine Tarot.
// The apiKey here is a public client identifier (safe to ship) — it's protected
// by Firebase security rules + authorized domains, NOT a secret.
import { Platform } from 'react-native';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const firebaseConfig = {
  apiKey: 'AIzaSyDNhsRnGWeb8XbkKl9HUDIr_YbFsTso_EY',
  authDomain: 'the-divine-tarot.firebaseapp.com',
  projectId: 'the-divine-tarot',
  storageBucket: 'the-divine-tarot.firebasestorage.app',
  messagingSenderId: '491968377977',
  appId: '1:491968377977:web:2603b1a9273163c39050a8',
  measurementId: 'G-0P4MJC69MM',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Persist the signed-in user across app restarts (native uses AsyncStorage).
export const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });

export const db = getFirestore(app);
export { app };

// Google OAuth Web client ID (from Firebase → Auth → Google → Web SDK config).
// Public identifier, safe to ship.
export const GOOGLE_WEB_CLIENT_ID =
  '491968377977-oo00ivdvpl41vmbhmjig7kp2t6juu7je.apps.googleusercontent.com';
