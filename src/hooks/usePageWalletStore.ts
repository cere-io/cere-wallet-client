import { WalletStore } from '~/stores';
import { useWalletStore } from './useWalletStore';

export const usePageWalletStore = () => {
  const store = useWalletStore();

  if (!(store instanceof WalletStore)) {
    throw new Error('Not in Page Wallet context');
  }

  return store;
};
