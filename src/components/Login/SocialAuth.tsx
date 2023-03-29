import { Loading, Logo } from '@cere-wallet/ui';
import { useEffect } from 'react';

import { SUPPORTED_SOCIAL_LOGINS } from '~/constants';
import { createNextUrl } from './createNextUrl';
import { useFirebaseAuth } from './useFirebaseAuth';

export type SocialAuthProps = {
  type?: typeof SUPPORTED_SOCIAL_LOGINS[number];
};

export const SocialAuth = ({ type }: SocialAuthProps) => {
  const { loading, token, login } = useFirebaseAuth();

  useEffect(() => {
    if (loading || !type) {
      return;
    }

    if (!token) {
      return login(type);
    }

    window.location.href = createNextUrl(token);
  }, [type, login, token, loading]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};
