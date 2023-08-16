import { UIProvider } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { WalletContext } from '~/hooks';
import { EmbeddedWalletStore } from '~/stores';
import EmbeddedModal from './EmbeddedModal';

const EmbeddedWallet = () => {
  const store = useMemo(() => new EmbeddedWalletStore(), []);
  const modal = store.popupManagerStore.currentModal;

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <UIProvider transparentBody whiteLabel={store.appContextStore.app?.whiteLabel}>
      <WalletContext.Provider value={store}>
        <WalletWidget />
        {modal && <EmbeddedModal modal={modal} />}
      </WalletContext.Provider>
    </UIProvider>
  );
};

export default observer(EmbeddedWallet);
