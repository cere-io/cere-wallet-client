import { useCallback, useEffect, useMemo, useState } from 'react';
import { initializeApp, FirebaseOptions } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithRedirect,
  inMemoryPersistence,
  browserPopupRedirectResolver,
} from '@firebase/auth';

import { FIREBASE_CONFIG, SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { AuthApiService } from '~/api/auth-api.service';

type AuthProviderType = typeof SUPPORTED_SOCIAL_LOGINS[number];

const providerMap = {
  google: GoogleAuthProvider,
  facebook: FacebookAuthProvider,
};

const useAuth = (options: FirebaseOptions) =>
  useMemo(() => {
    const auth = getAuth(initializeApp(options));

    auth.setPersistence(inMemoryPersistence);

    return auth;
  }, [options]);

const useIdToken = (auth: Auth, type: AuthProviderType) => {
  const [idToken, setIdToken] = useState<string | null>();

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
      const isValidProvider = user?.providerData.some(({ providerId }) => providerId === providerMap[type].PROVIDER_ID);

      if (!user || !isValidProvider) {
        return setIdToken(null);
      }

      const socialToken = await user.getIdToken(true);
      const idToken = await AuthApiService.getTokenBySocial(socialToken);

      setIdToken(idToken);
    });
  }, [auth, type]);

  return idToken;
};

export type UseFirebaseAuthOptions = {
  onTokenReady?: (token: string) => void;
};

export const useFirebaseAuth = (type: AuthProviderType) => {
  const auth = useAuth(FIREBASE_CONFIG);
  const token = useIdToken(auth, type);
  const provider = useMemo(() => {
    const provider = new providerMap[type]();

    provider.addScope('email');
    provider.addScope('profile');

    provider.setCustomParameters({
      prompt: 'select_account',
    });

    return provider;
  }, [type]);

  const login = useCallback(async () => {
    signInWithRedirect(auth, provider, browserPopupRedirectResolver);
  }, [auth, provider]);

  return {
    token,
    login,
    loading: token === undefined,
  };
};
