// Web auth/db backend — Firebase JS SDK.
// Phone OTP is not supported in the browser preview (returns null); native has it.
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { firebaseConfig } from './firebase';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const norm = (u) => (u ? { uid: u.uid, displayName: u.displayName || '', email: u.email || '', phoneNumber: u.phoneNumber || '' } : null);

export function watchAuth(cb) { return onAuthStateChanged(auth, (u) => cb(norm(u))); }
export function getCurrentUser() { return norm(auth.currentUser); }
export async function signOutUser() { await signOut(auth); }

export async function signInWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider());
  return true; // watchAuth sets the user
}

// Phone OTP: browser preview only — not available. (Real SMS works on the phone build.)
export async function startPhoneOtp() { return null; }
export async function confirmPhoneOtp() { return false; }

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}
export async function setUserProfile(uid, data, merge) {
  await setDoc(doc(db, 'users', uid), data, { merge: !!merge });
}

export async function getReadingsRemote(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  const d = snap.exists() ? snap.data() : null;
  return (d && d.readings) || [];
}
export async function setReadingsRemote(uid, list) {
  await setDoc(doc(db, 'users', uid), { readings: list }, { merge: true });
}
