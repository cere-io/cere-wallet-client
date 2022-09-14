import { useWalletStore } from './useWalletStore';

export const useBalanceStore = () => {
  const walletStore = useWalletStore();

  return walletStore.balanceStore;
};
