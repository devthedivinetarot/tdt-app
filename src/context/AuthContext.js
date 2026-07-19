import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signInGoogle } from './googleSignIn';

// ---------------------------------------------------------------------------
// Auth: Google (native via @react-native-google-signin, web via Firebase popup)
// + Firestore-backed profile.
// Phone OTP is temporarily disabled — the expo-firebase-recaptcha verifier
// pulled in a deprecated native module (expo-firebase-core) that fails the
// Android build on Gradle 8. To be re-enabled with a build-safe verifier.
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [pendingPhone, setPendingPhone] = useState(null);
  const confirmationRef = useRef(null);

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
      return await signInGoogle(auth); // platform-split: native SDK / web popup
    } catch (e) {
      return false;
    }
  };

  // Temporarily disabled (see file header). Returns false so the UI shows a
  // graceful "use Google sign-in" path instead of crashing.
  const startPhoneOTP = async () => false;

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
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
