import { observer } from 'mobx-react-lite';
import { Loading, Logo, Alert } from '@cere-wallet/ui';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { OpenLoginStore } from '~/stores/OpenLoginStore';

const createRedirectUrl = (url: string, sessionId: string) => {
  const finalUrl = new URL(url);
  const hashParams = new URLSearchParams(finalUrl.hash.slice(1));

  hashParams.append('sessionId', sessionId);
  finalUrl.hash = hashParams.toString();

  return finalUrl.toString();
};

const AuthorizeRedirect = () => {
  const [error, setError] = useState<string>();
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  const sessionId = hashParams.get('sessionId');
  const result = hashParams.get('result');
  const sessionNamespace = hashParams.get('sessionNamespace') || undefined;
  const redirectUrl = queryParams.get('redirectUrl');

  const store = useMemo(() => new OpenLoginStore({ sessionNamespace }), [sessionNamespace]);

  const handleAuthResult = useCallback(async () => {
    if (!result || !sessionId || !redirectUrl) {
      return;
    }

    const isRedirectAllowed = await store.isAllowedRedirectUrl(redirectUrl);

    if (!isRedirectAllowed) {
      throw new Error('The redirect url is not allowed');
    }

    store.syncWithEncodedState(result, sessionId);
    window.location.replace(createRedirectUrl(redirectUrl, sessionId));
  }, [store, redirectUrl, result, sessionId]);

  useEffect(() => {
    handleAuthResult().catch((error: Error) => setError(error.message));
  }, [handleAuthResult]);

  return error ? (
    <Alert sx={{ margin: 5 }} variant="filled" severity="warning">
      {error}
      <br />
      {redirectUrl}
    </Alert>
  ) : (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeRedirect);
