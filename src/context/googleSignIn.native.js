import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { GOOGLE_WEB_CLIENT_ID } from '../firebase';

// Native Google Sign-In → Firebase credential.
// webClientId MUST be the *Web* OAuth client (it's the "server" client Google
// uses to mint the ID token). An *Android* OAuth client with this app's package
// + SHA-1 must also exist in Google Cloud so Google trusts the app.
GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });

export async function signInGoogle(auth) {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  try { await GoogleSignin.signOut(); } catch (e) { /* fresh account chooser */ }
  const result = await GoogleSignin.signIn();
  // v13 returns { data: { idToken } }; older returns { idToken } — support both.
  const idToken = (result && result.data && result.data.idToken) || (result && result.idToken);
  if (!idToken) return false;
  await signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
  return true; // onAuthStateChanged sets the user
}
