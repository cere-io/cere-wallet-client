import { useWalletStore } from './useWalletStore';

export const useAssetStore = () => {
  const walletStore = useWalletStore();

  return walletStore.assetStore;
};
