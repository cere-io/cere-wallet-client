import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { EmbedWallet } from '@cere/embed-wallet'; // Cere wallet SDK package

const WalletContext = createContext<EmbedWallet | null>(null);

export const useWallet = () => {
  const wallet = useContext(WalletContext);

  if (!wallet) {
    throw new Error('Not in wallet context');
  }

  return wallet;
};

export const useWalletStatus = () => {
  const wallet = useWallet();
  const [status, setStatus] = useState(wallet.status);

  useEffect(() => {
    const unsubscribe = wallet.subscribe('status-update', setStatus);

    return () => unsubscribe();
  }, [wallet]);

  return status;
};

export const WalletProvider = ({ children }: PropsWithChildren<{}>) => {
  const wallet = useMemo(
    () =>
      new EmbedWallet({
        env: 'local',
      }),
    [],
  );

  return <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>;
};
