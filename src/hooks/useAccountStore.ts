import { useWalletStore } from './useWalletStore';

export const useAccountStore = () => {
  const walletStore = useWalletStore();

  return walletStore.accountStore;
};
