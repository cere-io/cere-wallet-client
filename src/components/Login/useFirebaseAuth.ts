import { useCallback, useEffect, useMemo, useState } from 'react';
import { initializeApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  Auth,
  getRedirectResult,
  UserCredential,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
} from '@firebase/auth';

import { FIREBASE_CONFIG, SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { AuthApiService } from '~/api/auth-api.service';

const useAuth = (options: FirebaseOptions) => useMemo(() => getAuth(initializeApp(options)), [options]);
const useRedirectResult = (auth: Auth) => {
  const [result, setResult] = useState<UserCredential | null>();

  useEffect(() => {
    getRedirectResult(auth).then(setResult);
  }, [auth]);

  return result;
};

const useIdToken = (auth: Auth) => {
  const result = useRedirectResult(auth);
  const [idToken, setIdToken] = useState<string | null>();

  useEffect(() => {
    if (result === null) {
      return setIdToken(null);
    }

    result?.user.getIdToken(true).then(AuthApiService.getTokenBySocial).then(setIdToken);
  }, [result]);

  return idToken;
};

const providerMap = {
  google: () => new GoogleAuthProvider(),
  facebook: () => new FacebookAuthProvider(),
};

export type UseFirebaseAuthOptions = {
  onTokenReady?: (token: string) => void;
};

export const useFirebaseAuth = ({ onTokenReady }: UseFirebaseAuthOptions = {}) => {
  const auth = useAuth(FIREBASE_CONFIG);
  const token = useIdToken(auth);

  const login = useCallback(
    (type: typeof SUPPORTED_SOCIAL_LOGINS[number]) => {
      const provider = providerMap[type]();

      provider.addScope('email');
      provider.addScope('profile');

      signInWithRedirect(auth, provider);
    },
    [auth],
  );

  useEffect(() => {
    if (token) {
      onTokenReady?.(token);
    }
  }, [token, onTokenReady]);

  return { loading: token === undefined, token, login };
};
