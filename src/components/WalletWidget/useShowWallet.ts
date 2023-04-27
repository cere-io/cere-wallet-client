import { useCallback } from 'react';
import { useEmbeddedWalletStore, useOpenLoginStore } from '~/hooks';

/**
 * Copied from Tor.us library.
 *
 * TODO: Remove or refactor this later.
 */
const windowFeatures = 'directories=0,titlebar=0,toolbar=0,status=0,location=0,menubar=0,height=700,width=1200';

/**
 * Tor.us integration library does not support opening wallet via communication channel.
 * So we have to create new window from here.
 *
 * TODO: Remove this manual window creation
 */
export const useShowWallet = () => {
  const { sessionNamespace, sessionId } = useOpenLoginStore();
  const { instanceId } = useEmbeddedWalletStore();

  return useCallback(
    (directory?: 'path' | 'home' | 'topup') => {
      const params = new URLSearchParams({ instanceId, sessionNamespace });

      if (sessionId) {
        params.append('sessionId', sessionId);
      }

      window.open(`/wallet/home${directory ? `/${directory}` : ''}?${params}`, instanceId, windowFeatures);
    },
    [instanceId, sessionId, sessionNamespace],
  );
};
