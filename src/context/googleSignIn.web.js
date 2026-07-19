import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Web: Firebase's own popup (localhost is pre-authorized; no Cloud setup needed).
export async function signInGoogle(auth) {
  await signInWithPopup(auth, new GoogleAuthProvider());
  return true; // onAuthStateChanged sets the user
}
