import { useWalletStore } from './useWalletStore';

export const useOpenLoginStore = () => {
  const walletStore = useWalletStore();

  return walletStore.openLoginStore;
};
