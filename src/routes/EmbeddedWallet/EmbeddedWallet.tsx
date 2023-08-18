import { UIProvider } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { WalletContext } from '~/hooks';
import { EmbeddedWalletStore } from '~/stores';
import EmbeddedModal from './EmbeddedModal';
import { useWallet } from '~/hooks';
import { toJS } from 'mobx';

const EmbeddedWallet = () => {
  const { instanceId } = useWallet();

  const store = useMemo(() => new EmbeddedWalletStore(instanceId), [instanceId]);
  const modal = store.popupManagerStore.currentModal;
  const whiteLabel = store.appContextStore.whiteLabel;

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <UIProvider transparentBody whiteLabel={toJS(whiteLabel)}>
      <WalletContext.Provider value={store}>
        <WalletWidget />
        {modal && <EmbeddedModal modal={modal} />}
      </WalletContext.Provider>
    </UIProvider>
  );
};

export default observer(EmbeddedWallet);
