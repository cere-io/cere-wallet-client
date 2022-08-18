import { useEffect, useMemo } from 'react';

import { WalletWidget } from '~/components';
import { WalletStore } from '~/stores';

const Iframe = () => {
  const store = useMemo(() => new WalletStore(), []);

  useEffect(() => {
    store.init();
  }, [store]);

  return <WalletWidget />;
};

export default Iframe;
