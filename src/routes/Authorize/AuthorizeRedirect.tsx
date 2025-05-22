import { observer } from 'mobx-react-lite';
import { Loading, Logo, Alert } from '@cere-wallet/ui';
import { useCallback, useEffect, useState } from 'react';

import { useOutletContext } from 'react-router-dom';
import { AuthorizePopupStore } from '~/stores';
import { useOpenLoginStore } from '~/hooks';
import { SessionStore } from '~/stores/SessionStore';
import { OpenLoginStore } from '~/stores/OpenLoginStore';

const AuthorizeRedirect = () => {
  console.log('Before AUTHEORIZE REDIRECT');
  const [error, setError] = useState<string>();
  const hashParams = new URLSearchParams(window.location.hash.slice(1));
  const queryParams = new URLSearchParams(window.location.search);
  const result = hashParams.get('result');
  const redirectUrl = queryParams.get('redirectUrl');

  const store = useOutletContext<AuthorizePopupStore>();
  const sessionStore = new SessionStore({
    sessionNamespace: 'abc',
  });

  const openLoginStore = new OpenLoginStore(sessionStore);

  const handleAuthResult = useCallback(async () => {
    console.log('BEFORE openLoginStore.login()');

    await openLoginStore.login();
    console.log('AFTER openLoginStore.login()');

    if (!result || !redirectUrl) {
      return;
    }

    await store.acceptEncodedState(result);
  }, [store, redirectUrl, result]);

  useEffect(() => {
    handleAuthResult().catch((error: Error) => setError(error.message));
  }, [handleAuthResult]);

  console.log('INIT AUTHEORIZE REDIRECT');
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
