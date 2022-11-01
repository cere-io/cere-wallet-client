import { useEmbeddedWalletStore } from './useEmbeddedWalletStore';

export const usePopupManagerStore = () => {
  const walletStore = useEmbeddedWalletStore();

  return walletStore.popupManagerStore;
};
