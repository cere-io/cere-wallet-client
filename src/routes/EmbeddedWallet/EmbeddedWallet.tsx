import { UIProvider } from '@cere-wallet/ui';
import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { WalletContext } from '~/hooks';
import { EmbeddedWalletStore } from '~/stores';

const EmbeddedWallet = () => {
  const store = useMemo(() => new EmbeddedWalletStore(), []);

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <UIProvider transparentBody>
      <WalletContext.Provider value={store}>
        <WalletWidget />
      </WalletContext.Provider>
    </UIProvider>
  );
};

export default EmbeddedWallet;
