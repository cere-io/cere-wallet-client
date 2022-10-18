import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Loading, Logo } from '@cere-wallet/ui';

import { usePopupStore } from '~/hooks';
import { AuthorizePopupStore } from '~/stores';

const AuthorizeEnd = () => {
  const store = usePopupStore((popupId) => new AuthorizePopupStore(popupId));
  const params = new URLSearchParams(window.location.hash.slice(1));
  const result = params.get('result');
  const sessionId = params.get('sessionId');

  useEffect(() => {
    if (result && sessionId) {
      store.end({ result, sessionId });
    }
  }, [result, sessionId, store]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeEnd);
