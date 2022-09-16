import { EmbeddedWalletStore } from '~/stores';
import { useWalletStore } from './useWalletStore';

export const useEmbeddedWalletStore = () => {
  const store = useWalletStore();

  if (!(store instanceof EmbeddedWalletStore)) {
    throw new Error('Not in Embedded Wallet context');
  }

  return store;
};
