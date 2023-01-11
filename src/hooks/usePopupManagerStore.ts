import { useWalletStore } from './useWalletStore';

export const usePopupManagerStore = () => {
  const walletStore = useWalletStore();

  return walletStore.popupManagerStore;
};
