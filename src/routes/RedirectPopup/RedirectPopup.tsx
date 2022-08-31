import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Loading } from '@cere-wallet/ui';

import { RedirectPopupStore } from '~/stores';
import { Logo } from '~/components';

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
    <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
      <Loading>
        <Logo />
      </Loading>
    </Box>
  );
};
