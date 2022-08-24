import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { WalletLayout } from '~/components';
import { WalletStore } from '~/stores';

const Wallet = () => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId') || undefined;
  const store = useMemo(() => new WalletStore(instanceId), [instanceId]);

  const account = store.accountStore.account;
  const network = store.networkStore.network;

  useEffect(() => {
    store.init();
  }, [store]);

  useEffect(() => {
    console.log('Account updated', account);
  }, [account]);

  useEffect(() => {
    console.log('Network updated', network);
  }, [network]);

  return <WalletLayout />;
};

export default observer(Wallet);
