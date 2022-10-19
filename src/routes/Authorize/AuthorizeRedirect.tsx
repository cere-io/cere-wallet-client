import { observer } from 'mobx-react-lite';
import { Loading, Logo } from '@cere-wallet/ui';
import { useMemo } from 'react';

import { OpenLoginStore } from '~/stores/OpenLoginStore';

const AuthorizeRedirect = () => {
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = hashParams.get('sessionId');
  const result = hashParams.get('result');
  const sessionNamespace = hashParams.get('sessionNamespace') || undefined;
  const redirectUrl = queryParams.get('redirectUrl');

  const store = useMemo(() => new OpenLoginStore({ sessionNamespace }), [sessionNamespace]);

  if (result && sessionId) {
    store.syncWithEncodedState(result, sessionId);
  }

  if (redirectUrl) {
    window.location.replace(redirectUrl);
  }

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeRedirect);
