import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  onAuthStateChanged, signInWithPhoneNumber, signOut as fbSignOut,
  GoogleAuthProvider, signInWithCredential, signInWithPopup,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { auth, db, firebaseConfig, GOOGLE_WEB_CLIENT_ID } from '../firebase';

WebBrowser.maybeCompleteAuthSession();

// ---------------------------------------------------------------------------
// Real auth: Firebase Phone (SMS OTP) + Firestore-backed profile.
// Google is stubbed until the Google provider is enabled in Firebase (that's
// what adds the OAuth client to google-services.json).
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [pendingPhone, setPendingPhone] = useState(null);
  const confirmationRef = useRef(null);
  const recaptchaRef = useRef(null);

  // Google sign-in (Expo AuthSession → Firebase credential).
  const [, googleResponse, googlePrompt] = Google.useIdTokenAuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
  });
  useEffect(() => {
    if (googleResponse && googleResponse.type === 'success') {
      const idToken = googleResponse.params && googleResponse.params.id_token;
      if (idToken) {
        signInWithCredential(auth, GoogleAuthProvider.credential(idToken)).catch(() => {});
      }
    }
  }, [googleResponse]);

  useEffect(() => {
    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const ref = doc(db, 'users', fbUser.uid);
          let data = null;
          try {
            const snap = await getDoc(ref);
            if (snap.exists()) data = snap.data();
          } catch (e) { /* offline / rules — continue */ }
          if (!data) {
            data = {
              name: fbUser.displayName || '',
              provider: fbUser.phoneNumber ? 'phone' : 'google',
              phone: fbUser.phoneNumber || '',
              email: fbUser.email || '',
              profile: {},
              createdAt: Date.now(),
            };
            try { await setDoc(ref, data); } catch (e) { /* ignore */ }
          }
          setUser({ id: fbUser.uid, ...data });
        } else {
          setUser(null);
        }
        setReady(true);
      });
    } catch (e) {
      setReady(true); // never block the app if auth misconfigures
    }
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // Firebase handles the OAuth popup; localhost is a pre-authorized
        // domain, so no Google Cloud redirect-URI setup is needed for the
        // web preview. Requires the Google provider enabled in Firebase Auth.
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider); // onAuthStateChanged sets the user
        return true;
      }
      const res = await googlePrompt();
      return !!(res && res.type === 'success'); // onAuthStateChanged sets the user
    } catch (e) {
      return false;
    }
  };

  const startPhoneOTP = async (phone) => {
    if (!/^\d{10}$/.test(phone)) return false;
    // Phone OTP uses a native reCAPTCHA modal — not available in the web preview.
    if (Platform.OS === 'web' || !recaptchaRef.current) return false;
    try {
      confirmationRef.current = await signInWithPhoneNumber(auth, '+91' + phone, recaptchaRef.current);
      setPendingPhone(phone);
      return true;
    } catch (e) {
      return false;
    }
  };

  const verifyOTP = async (code) => {
    if (!/^\d{6}$/.test(code) || !confirmationRef.current) return false;
    try {
      await confirmationRef.current.confirm(code);
      confirmationRef.current = null;
      setPendingPhone(null);
      return true; // onAuthStateChanged sets the user
    } catch (e) {
      return false;
    }
  };

  const cancelPhone = () => { confirmationRef.current = null; setPendingPhone(null); };

  const saveProfile = async (fields) => {
    if (!user) return;
    const { name: fName, ...profFields } = fields;
    const name = fName !== undefined ? fName : user.name;
    const nextProfile = { ...(user.profile || {}), ...profFields };
    setUser({ ...user, name, profile: nextProfile });
    try {
      await setDoc(doc(db, 'users', user.id), { name, profile: nextProfile }, { merge: true });
    } catch (e) { /* ignore write errors */ }
  };

  const signOut = async () => {
    try { await fbSignOut(auth); } catch (e) { /* ignore */ }
    setUser(null);
    cancelPhone();
  };

  return (
    <AuthContext.Provider
      value={{ user, ready, pendingPhone, signInWithGoogle, startPhoneOTP, verifyOTP, cancelPhone, saveProfile, signOut }}
    >
      {children}
      {Platform.OS !== 'web' && (
        <FirebaseRecaptchaVerifierModal
          ref={recaptchaRef}
          firebaseConfig={firebaseConfig}
          attemptInvisibleVerification
        />
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
