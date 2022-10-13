import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Loading, Logo } from '@cere-wallet/ui';

import { usePopupStore } from '~/hooks';
import { AuthorizePopupStore } from '~/stores';

const AuthorizeDone = () => {
  const store = usePopupStore((popupId) => new AuthorizePopupStore(popupId));
  const params = new URLSearchParams(window.location.hash.slice(1));
  const encodedResult = params.get('result');

  useEffect(() => {
    if (encodedResult) {
      store.acceptAuthorization(encodedResult);
    }
  }, [encodedResult, store]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeDone);
