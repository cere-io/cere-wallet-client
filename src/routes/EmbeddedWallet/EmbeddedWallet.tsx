import { useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { UIProvider } from '@cere-wallet/ui';
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
    <UIProvider transparentBody>
      <WalletContext.Provider value={store}>
        <WalletWidget />
        {modal && <EmbeddedModal modal={modal} />}
      </WalletContext.Provider>
    </UIProvider>
  );
};

export default observer(EmbeddedWallet);
