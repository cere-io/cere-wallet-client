import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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

    return store.waitForRedirectRequest(navigate);
  }, [store, instanceId, navigate]);

  return <></>;
};
