import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { Hello } from '~/components';
import { useWalletStore } from '~/stores';

const Wallet = () => {
  const { ticks, start, stop } = useWalletStore();

  useEffect(() => {
    start();

    return () => stop();
  }, [start, stop]);

  return <Hello counter={ticks} />;
};

export default observer(Wallet);
