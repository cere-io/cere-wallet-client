import { useCallback, useEffect, useMemo, useState } from 'react';
import { initializeApp, FirebaseOptions } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, FacebookAuthProvider, signInWithRedirect } from '@firebase/auth';

import { FIREBASE_CONFIG, SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { AuthApiService } from '~/api/auth-api.service';

const useAuth = (options: FirebaseOptions) => useMemo(() => getAuth(initializeApp(options)), [options]);

const useIdToken = (auth: Auth) => {
  const [idToken, setIdToken] = useState<string | null>();

  useEffect(() => {
    return auth.onAuthStateChanged(async (user) => {
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
  google: () => new GoogleAuthProvider(),
  facebook: () => new FacebookAuthProvider(),
};

export type UseFirebaseAuthOptions = {
  onTokenReady?: (token: string) => void;
};

export const useFirebaseAuth = () => {
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

  return { loading: token === undefined, token, login };
};
