import { observer } from 'mobx-react-lite';
import { Loading, Logo } from '@cere-wallet/ui';
import { useMemo } from 'react';

import { OpenLoginStore } from '~/stores/OpenLoginStore';

const createRedirectUrl = (url: string, sessionId: string) => {
  const finalUrl = new URL(url);
  const hashParams = new URLSearchParams(finalUrl.hash.slice(1));

  hashParams.append('sessionId', sessionId);
  finalUrl.hash = hashParams.toString();

  return finalUrl.toString();
};

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

  if (redirectUrl && sessionId) {
    window.location.replace(createRedirectUrl(redirectUrl, sessionId));
  }

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeRedirect);
