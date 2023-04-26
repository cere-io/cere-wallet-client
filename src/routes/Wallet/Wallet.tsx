import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { useSearchParams, Outlet } from 'react-router-dom';
import { reaction } from 'mobx';
import { Loading, Logo } from '@cere-wallet/ui';

import { AppContextBanner, CereTourProvider, WalletLayout, WalletLayoutProps } from '~/components';
import { WalletContext } from '~/hooks';
import { WalletStore } from '~/stores';
import WalletModal from './WalletModal';

export type WalletProps = Pick<WalletLayoutProps, 'menu'>;

const Wallet = ({ menu }: WalletProps) => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId') || undefined;
  const sessionNamespace = params.get('sessionNamespace') || undefined;
  const sessionId = params.get('sessionId') || undefined;
  const store = useMemo(
    () => new WalletStore(instanceId, sessionNamespace, sessionId),
    [instanceId, sessionNamespace, sessionId],
  );
  const modal = store.popupManagerStore.currentModal;

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
    <CereTourProvider steps={[]}>
      <WalletContext.Provider value={store}>
        {store.status === 'ready' ? (
          <>
            <AppContextBanner />

            <WalletLayout menu={menu}>
              <Outlet />
            </WalletLayout>

            {modal && <WalletModal modal={modal} />}
          </>
        ) : (
          <Loading fullScreen>
            <Logo />
          </Loading>
        )}
      </WalletContext.Provider>
    </CereTourProvider>
  );
};

export default observer(Wallet);
