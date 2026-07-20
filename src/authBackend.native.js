// Native auth/db backend — @react-native-firebase (reads google-services.json).
// Gives real SMS phone OTP (no reСAPTCHA) + native Google sign-in.
import authModule from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GOOGLE_WEB_CLIENT_ID } from './firebase';

const auth = authModule;

let googleReady = false;
function ensureGoogle() {
  if (googleReady) return;
  GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  googleReady = true;
}

const norm = (u) => (u ? { uid: u.uid, displayName: u.displayName || '', email: u.email || '', phoneNumber: u.phoneNumber || '' } : null);

export function watchAuth(cb) { return auth().onAuthStateChanged((u) => cb(norm(u))); }
export function getCurrentUser() { return norm(auth().currentUser); }

export async function signOutUser() {
  try { await GoogleSignin.signOut(); } catch (e) { /* ignore */ }
  try { await auth().signOut(); } catch (e) { /* ignore */ }
}

export async function signInWithGoogle() {
  ensureGoogle();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  try { await GoogleSignin.signOut(); } catch (e) { /* fresh chooser */ }
  const res = await GoogleSignin.signIn();
  const idToken = (res && res.data && res.data.idToken) || (res && res.idToken);
  if (!idToken) return false;
  const cred = auth.GoogleAuthProvider.credential(idToken);
  await auth().signInWithCredential(cred);
  return true; // watchAuth sets the user
}

// Returns a confirmation object with .confirm(code); throws on error.
export async function startPhoneOtp(phoneE164) {
  return auth().signInWithPhoneNumber(phoneE164);
}
export async function confirmPhoneOtp(confirmation, code) {
  if (!confirmation) return false;
  await confirmation.confirm(code);
  return true; // watchAuth sets the user
}

export async function getUserProfile(uid) {
  const snap = await firestore().collection('users').doc(uid).get();
  return snap.exists ? snap.data() : null;
}
export async function setUserProfile(uid, data, merge) {
  await firestore().collection('users').doc(uid).set(data, { merge: !!merge });
}

export async function getReadingsRemote(uid) {
  const snap = await firestore().collection('users').doc(uid).get();
  const d = snap.exists ? snap.data() : null;
  return (d && d.readings) || [];
}
export async function setReadingsRemote(uid, list) {
  await firestore().collection('users').doc(uid).set({ readings: list }, { merge: true });
}
