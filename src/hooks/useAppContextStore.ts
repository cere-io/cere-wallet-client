import { useWalletStore } from './useWalletStore';

export const useAppContextStore = () => {
  const walletStore = useWalletStore();

  return walletStore.appContextStore;
};
