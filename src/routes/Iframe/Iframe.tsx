import { useEffect, useRef } from 'react';

import { WalletWidget } from '~/components';
import { WalletStore } from '~/stores';

const Iframe = () => {
  const storeRef = useRef<WalletStore>();

  useEffect(() => {
    if (storeRef.current) {
      return;
    }

    storeRef.current = new WalletStore();
    storeRef.current.init();
  }, []);

  return <WalletWidget />;
};

export default Iframe;
