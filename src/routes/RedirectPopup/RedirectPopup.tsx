import { useEffect } from 'react';
import { Loading, Logo } from '@cere-wallet/ui';
import { usePopupStore } from '~/hooks';
import { RedirectPopupStore } from '~/stores';

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
