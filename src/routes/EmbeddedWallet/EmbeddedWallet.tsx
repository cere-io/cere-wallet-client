import { UIProvider } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { WalletContext, useWallet } from '~/hooks';
import { EmbeddedWalletStore } from '~/stores';
import EmbeddedModal from './EmbeddedModal';
import { toJS } from 'mobx';

const availableGames: string[] = ['metaverse-dash-run', 'candy-jam'];

const EmbeddedWallet = () => {
  const { instanceId } = useWallet();

  const store = useMemo(() => new EmbeddedWalletStore(instanceId), [instanceId]);
  const modal = store.popupManagerStore.currentModal;
  const whiteLabel = store.appContextStore.whiteLabel;
  const isGame = availableGames.includes(store.appContextStore.app?.appId as string); // TODO remove after promo

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <UIProvider transparentBody isGame={isGame} whiteLabel={toJS(whiteLabel)}>
      <WalletContext.Provider value={store}>
        <WalletWidget />
        {modal && <EmbeddedModal showClose={!isGame} modal={modal} />}
      </WalletContext.Provider>
    </UIProvider>
  );
};

export default observer(EmbeddedWallet);
