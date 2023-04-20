import { observer } from 'mobx-react-lite';

import { usePopupStore } from '~/hooks';
import { AuthorizePopupStore } from '~/stores';
import { Outlet, useSearchParams } from 'react-router-dom';

const Authorize = () => {
  const [params] = useSearchParams();
  const sessionNamespace = params.get('sessionNamespace') || undefined;
  const redirectUrl = params.get('callbackUrl') || '/authorize/redirect';

  const store = usePopupStore((popupId) => new AuthorizePopupStore(popupId, redirectUrl, sessionNamespace));

  return <Outlet context={store} />;
};

export default observer(Authorize);
