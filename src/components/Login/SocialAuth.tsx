import { Loading, Logo } from '@cere-wallet/ui';
import { useEffect } from 'react';

import { SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { createNextUrl } from './createNextUrl';
import { useFirebaseAuth } from './useFirebaseAuth';

export type SocialAuthProps = {
  type: typeof SUPPORTED_SOCIAL_LOGINS[number];
};

export const SocialAuth = ({ type }: SocialAuthProps) => {
  const { loading, token, login } = useFirebaseAuth(type);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!token) {
      return login();
    }

    window.location.href = createNextUrl(token);
  }, [login, token, loading]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};
