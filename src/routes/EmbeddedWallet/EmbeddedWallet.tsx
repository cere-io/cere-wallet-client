import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { EmbeddedWalletStore } from '~/stores';

const EmbeddedWallet = () => {
  const store = useMemo(() => new EmbeddedWalletStore(), []);

  useEffect(() => {
    store.init();
  }, [store]);

  return <WalletWidget />;
};

export default EmbeddedWallet;
