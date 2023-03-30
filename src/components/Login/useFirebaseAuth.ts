import { useCallback, useEffect, useMemo, useState } from 'react';
import { initializeApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
  browserSessionPersistence,
} from '@firebase/auth';

import { FIREBASE_CONFIG, SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { AuthApiService } from '~/api/auth-api.service';

type AuthProviderType = typeof SUPPORTED_SOCIAL_LOGINS[number];

const useAuth = (options: FirebaseOptions) =>
  useMemo(() => {
    const auth = getAuth(initializeApp(options));

    auth.setPersistence(browserSessionPersistence);

    return auth;
  }, [options]);

const useIdToken = (auth: Auth) => {
  const [idToken, setIdToken] = useState<string | null>();

  useEffect(() => {
    return auth.onIdTokenChanged(async (user) => {
      if (!user) {
        return setIdToken(null);
      }

      const socialToken = await user.getIdToken(true);
      const idToken = await AuthApiService.getTokenBySocial(socialToken);

      setIdToken(idToken);
    });
  }, [auth]);

  return idToken;
};

const providerMap = {
  google: GoogleAuthProvider,
  facebook: FacebookAuthProvider,
};

export type UseFirebaseAuthOptions = {
  onTokenReady?: (token: string) => void;
};

export const useFirebaseAuth = (type: AuthProviderType) => {
  const auth = useAuth(FIREBASE_CONFIG);
  const token = useIdToken(auth);
  const provider = useMemo(() => {
    const provider = new providerMap[type]();

    provider.addScope('email');
    provider.addScope('profile');

    return provider;
  }, [type]);

  const login = useCallback(() => {
    signInWithRedirect(auth, provider);
  }, [auth, provider]);

  return {
    token,
    login,
    loading: token === undefined,
  };
};
