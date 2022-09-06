import { createContext, useContext } from 'react';
import { WalletStore } from '~/stores';

export const WalletContext = createContext<WalletStore | null>(null);

export const useWalletStore = () => {
  const store = useContext(WalletContext);

  if (!store) {
    throw new Error('Not in Wallet context');
  }

  return store;
};
