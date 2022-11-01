import { UIProvider } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';

import { PopupManager, WalletWidget } from '~/components';
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
        <PopupManager />
      </WalletContext.Provider>
    </UIProvider>
  );
};

export default observer(EmbeddedWallet);
