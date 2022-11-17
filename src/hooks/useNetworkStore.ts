import { useWalletStore } from './useWalletStore';

export const useNetworkStore = () => {
  const walletStore = useWalletStore();

  return walletStore.networkStore;
};
