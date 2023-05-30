import { observer } from 'mobx-react-lite';

import { usePopupStore } from '~/hooks';
import { AuthorizePopupStore } from '~/stores';
import { Outlet, useSearchParams } from 'react-router-dom';

const Authorize = () => {
  const [params] = useSearchParams();
  const sessionNamespace = params.get('sessionNamespace') || undefined;
  const callbackUrl = params.get('callbackUrl') || '/authorize/redirect';
  const redirectUrl = params.get('redirectUrl') ?? undefined;
  const forceMfa = params.get('mfa') === 'force';

  const store = usePopupStore(
    (popupId) =>
      new AuthorizePopupStore(popupId, {
        forceMfa,
        callbackUrl,
        redirectUrl,
        sessionNamespace,
      }),
  );

  return <Outlet context={store} />;
};

export default observer(Authorize);
