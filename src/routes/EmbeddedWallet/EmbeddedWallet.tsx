import { UIProvider } from '@cere-wallet/ui';
import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { EmbeddedWalletStore } from '~/stores';

const EmbeddedWallet = () => {
  const store = useMemo(() => new EmbeddedWalletStore(), []);

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <UIProvider transparentBody>
      <WalletWidget store={store} />
    </UIProvider>
  );
};

export default EmbeddedWallet;
