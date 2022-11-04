import { useWalletStore } from './useWalletStore';

export const useAuthenticationStore = () => {
  const walletStore = useWalletStore();

  return walletStore.authenticationStore;
};
