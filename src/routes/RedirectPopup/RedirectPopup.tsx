import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Logo, Loading } from '@cere-wallet/ui';

import { RedirectPopupStore } from '~/stores';

export const RedirectPopup = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const instanceId = params.get('preopenInstanceId');
  const store = useMemo(() => instanceId && new RedirectPopupStore(instanceId), [instanceId]);

  useEffect(() => {
    if (!store) {
      return;
    }

    return store.waitForRedirectRequest((url) => {
      navigate(url, { replace: true });
    });
  }, [store, instanceId, navigate]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};
