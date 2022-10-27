import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { useSearchParams, Outlet } from 'react-router-dom';
import { Loading, Logo } from '@cere-wallet/ui';

import { AppContextBanner, WalletLayout, WalletLayoutProps } from '~/components';
import { WalletContext } from '~/hooks';
import { WalletStore } from '~/stores';

export type WalletProps = Pick<WalletLayoutProps, 'menu'>;

const Wallet = ({ menu }: WalletProps) => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId') || undefined;
  const store = useMemo(() => new WalletStore(instanceId), [instanceId]);

  useEffect(() => {
    store.init();
  }, [store]);

  return (
    <WalletContext.Provider value={store}>
      {store.isReady() ? (
        <>
          <AppContextBanner />

          <WalletLayout menu={menu}>
            <Outlet />
          </WalletLayout>
        </>
      ) : (
        <Loading fullScreen>
          <Logo />
        </Loading>
      )}
    </WalletContext.Provider>
  );
};

export default observer(Wallet);
