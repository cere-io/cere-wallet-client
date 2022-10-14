import { useEffect } from 'react';
import { Logo, Loading } from '@cere-wallet/ui';

import { RedirectPopupStore } from '~/stores';
import { usePopupStore } from '~/hooks';

export const RedirectPopup = () => {
  const store = usePopupStore((popupId) => new RedirectPopupStore(popupId));

  useEffect(() => {
    return store.waitForRedirectRequest((url) => {
      window.location.replace(url);
    });
  }, [store]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};
