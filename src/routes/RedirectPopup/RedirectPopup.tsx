import { useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PopupManagerStore } from '~/stores';

export const RedirectPopup = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const instanceId = params.get('preopenInstanceId');
  const store = useMemo(() => new PopupManagerStore(), []);

  useEffect(() => {
    if (!instanceId) {
      return;
    }

    store.waitForRedirectRequest(instanceId, navigate);
  }, [store, instanceId, navigate]);

  return <></>;
};
