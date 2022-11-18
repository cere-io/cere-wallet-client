import { useEffect, useMemo } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
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

    return reaction(
      () => store.status,
      (status) => {
        if (status === 'unauthenticated') {
          store.authenticationStore.login({
            redirectUrl: window.location.origin,
          });
        }
      },
    );
  }, [store]);

  return (
    <WalletContext.Provider value={store}>
      {store.status === 'ready' ? (
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
