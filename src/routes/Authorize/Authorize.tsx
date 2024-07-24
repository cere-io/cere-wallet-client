import { observer } from 'mobx-react-lite';
import { Outlet, useSearchParams } from 'react-router-dom';

import { usePopupStore, useWallet } from '~/hooks';
import { AuthorizePopupStore } from '~/stores';

const Authorize = () => {
  const [params] = useSearchParams();
  const sessionNamespace = params.get('sessionNamespace') || undefined;
  const callbackUrl = params.get('callbackUrl') || '/authorize/redirect';
  const redirectUrl = params.get('redirectUrl') ?? undefined;
  const forceMfa = params.get('mfa') === 'force';
  const loginHint = params.get('loginHint') ?? undefined;
  const email = params.get('email') ?? undefined;

  const wallet = useWallet();
  const store = usePopupStore(
    (popupId) =>
      new AuthorizePopupStore(wallet, {
        popupId,
        forceMfa,
        callbackUrl,
        redirectUrl,
        sessionNamespace,
        loginHint,
        email,
        appId: wallet.appContextStore.app?.appId,
      }),
    [wallet],
  );

  return <Outlet context={store} />;
};

export default observer(Authorize);
