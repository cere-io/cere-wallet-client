import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { SignIn } from '~/components';

const createNextUrl = (idToken?: string) => {
  const url = new URL(window.location.href);
  const nextUrl = new URL(url.searchParams.get('redirect_uri')!);
  const nextParams = new URLSearchParams(url.search);

  if (idToken) {
    nextParams.set('id_token', idToken);
  }

  nextUrl.hash = nextParams.toString();

  return nextUrl.toString();
};

const Authorize = () => {
  const handleTokenReady = useCallback((idToken: string) => {
    window.location.replace(createNextUrl(idToken));
  }, []);

  return <SignIn onTokenReady={handleTokenReady} />;
};

export default observer(Authorize);
