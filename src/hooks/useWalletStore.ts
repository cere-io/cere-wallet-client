import { createContext, useContext } from 'react';
import { EmbeddedWalletStore, WalletStore } from '~/stores';

export const WalletContext = createContext<WalletStore | EmbeddedWalletStore | null>(null);

export const useWalletStore = () => {
  const store = useContext(WalletContext);

  if (!store) {
    throw new Error('Not in Wallet context');
  }

  return store;
};