import { useWalletStore } from './useWalletStore';

export const useCollectiblesStore = () => {
  const walletStore = useWalletStore();

  return walletStore.collectiblesStore;
};
