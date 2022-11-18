import { FacebookAuthProvider, GoogleAuthProvider, getAuth, signInWithPopup } from '@firebase/auth';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const getTokenWithGoogle = async (): Promise<string> => {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    const res = await signInWithPopup(auth, googleProvider);
    return res.user.getIdToken(true);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getTokenWithFacebook = async (): Promise<string> => {
  try {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const facebookProvider = new FacebookAuthProvider();
    facebookProvider.addScope('email');
    facebookProvider.addScope('public_profile');
    const res = await signInWithPopup(auth, facebookProvider);
    return res.user.getIdToken(true);
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const createNextUrl = (idToken?: string) => {
  const url = new URL(window.location.href);
  const nextUrl = new URL(url.searchParams.get('redirect_uri')!);
  const nextParams = new URLSearchParams(url.search);

  if (idToken) {
    nextParams.set('id_token', idToken);
  }

  nextUrl.hash = nextParams.toString();

  return nextUrl.toString();
};
