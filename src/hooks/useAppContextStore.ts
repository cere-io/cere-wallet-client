import { useWallet } from './useWalletStore';

export const useAppContextStore = () => {
  const wallet = useWallet();

  return wallet.appContextStore;
};
