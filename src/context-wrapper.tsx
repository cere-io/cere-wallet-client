import { useEffect, useMemo } from 'react';
import { UIProvider } from '@cere-wallet/ui';
import { WalletContext } from '~/hooks';
import { Router } from './routes';
import { WalletStore } from '~/stores';

export const ContextWrapper = () => {
  const url = new URL(window.location.href);
  let instanceId: string | null;
  let sessionNamespace: string | null;
  let sessionId: string | null;

  instanceId = url.searchParams.get('preopenInstanceId');
  sessionNamespace = url.searchParams.get('sessionNamespace');
  sessionId = url.searchParams.get('sessionId');

  const store: any = useMemo(
    () => instanceId && sessionNamespace && new WalletStore(instanceId, sessionNamespace),
    [instanceId, sessionNamespace],
  );

  useEffect(() => {
    if (store) {
      store.init(sessionId);
    }
  }, [store, sessionId]);

  return (
    <WalletContext.Provider value={store}>
      <UIProvider>
        <Router />
      </UIProvider>
    </WalletContext.Provider>
  );
};
