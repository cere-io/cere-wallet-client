import { createContext, useContext } from 'react';
import { DummyWalletStore, EmbeddedWalletStore, WalletStore } from '~/stores';

export const WalletContext = createContext<WalletStore | EmbeddedWalletStore | DummyWalletStore | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);

  if (!wallet) {
    throw new Error('Not in Wallet context');
  }

  return wallet;
};

export const useWalletStore = () => {
  const store = useWallet();

  if (store instanceof DummyWalletStore) {
    throw new Error('Wallet context is not ready');
  }

  return store;
};
