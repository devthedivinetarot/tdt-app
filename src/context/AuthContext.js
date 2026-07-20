import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  watchAuth, getUserProfile, setUserProfile, signOutUser,
  signInWithGoogle as backendGoogle, startPhoneOtp, confirmPhoneOtp,
} from '../authBackend';

// ---------------------------------------------------------------------------
// Auth: native uses @react-native-firebase (real SMS OTP + native Google);
// web uses the Firebase JS SDK (Google popup; phone OTP unavailable in preview).
// Profiles are stored in Firestore under users/{uid}.
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
      unsub = watchAuth(async (fbUser) => {
        if (fbUser) {
          let data = null;
          try { data = await getUserProfile(fbUser.uid); } catch (e) { /* offline / rules */ }
          if (!data) {
            data = {
              name: fbUser.displayName || '',
              provider: fbUser.phoneNumber ? 'phone' : 'google',
              phone: fbUser.phoneNumber || '',
              email: fbUser.email || '',
              profile: {},
              createdAt: Date.now(),
            };
            try { await setUserProfile(fbUser.uid, data, false); } catch (e) { /* ignore */ }
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
    try { return await backendGoogle(); } catch (e) { return false; }
  };

  const startPhoneOTP = async (phone) => {
    if (!/^\d{10}$/.test(phone)) return false;
    try {
      const confirmation = await startPhoneOtp('+91' + phone);
      if (!confirmation) return false; // web preview: not supported
      confirmationRef.current = confirmation;
      setPendingPhone(phone);
      return true;
    } catch (e) {
      return false;
    }
  };

  const verifyOTP = async (code) => {
    if (!/^\d{6}$/.test(code) || !confirmationRef.current) return false;
    try {
      const ok = await confirmPhoneOtp(confirmationRef.current, code);
      if (ok) { confirmationRef.current = null; setPendingPhone(null); }
      return ok; // watchAuth sets the user
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
      await setUserProfile(user.id, { name, profile: nextProfile }, true);
    } catch (e) { /* ignore write errors */ }
  };

  const signOut = async () => {
    try { await signOutUser(); } catch (e) { /* ignore */ }
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
