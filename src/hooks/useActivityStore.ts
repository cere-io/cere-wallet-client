import { useWalletStore } from './useWalletStore';

export const useActivityStore = () => {
  const walletStore = useWalletStore();

  return walletStore.activityStore;
};
