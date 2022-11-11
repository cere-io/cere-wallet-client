import { useMediaQuery } from '@cere-wallet/ui';
import { useCallback } from 'react';
import { useEmbeddedWalletStore } from './useEmbeddedWalletStore';

export const useFullScreen = () => {
  const isFullscreenReady = useMediaQuery('(min-width:100px)');
  const store = useEmbeddedWalletStore();
  const setFullScreen = useCallback(
    (isFull: boolean) => {
      store.isFullscreen = isFull;
    },
    [store],
  );

  return [store.isFullscreen && isFullscreenReady, setFullScreen] as const;
};
