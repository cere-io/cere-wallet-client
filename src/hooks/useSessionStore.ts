import { useWalletStore } from './useWalletStore';

export const useSessionStore = () => {
  const walletStore = useWalletStore();

  return walletStore.sessionStore;
};
