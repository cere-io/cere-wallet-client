import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useOutletContext } from 'react-router-dom';
import { Loading, Logo } from '@cere-wallet/ui';

import { AuthorizePopupStore } from '~/stores';

const AuthorizeClose = () => {
  const store = useOutletContext<AuthorizePopupStore>();

  const params = new URLSearchParams(window.location.hash.slice(1));
  const state = params.get('result');
  const sessionId = params.get('sessionId');

  useEffect(() => {
    if (state && sessionId) {
      store.acceptResult({ state, sessionId });
    }
  }, [state, sessionId, store]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeClose);
