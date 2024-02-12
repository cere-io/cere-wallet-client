import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Stack, useIsMobile, useTheme, ArrowBackIosIcon } from '@cere-wallet/ui';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';

import { LoginPage } from '~/components';
import { AuthorizePopupStore } from '~/stores';
import { useAppContextStore } from '~/hooks';

const AuthorizeLogin = ({ variant = 'signin' }: { variant?: 'signin' | 'signup' }) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const store = useOutletContext<AuthorizePopupStore>();
  const { isGame } = useTheme();
  const appStore = useAppContextStore();

  const skipLoginIntro = Boolean(appStore.whiteLabel?.skipLoginIntro);

  const handleLoginRequest = useCallback(
    async (idToken: string) => {
      await store.login(idToken);

      if (store.permissions) {
        return navigate({ ...location, pathname: '/authorize/permissions' });
      } else {
        await store.acceptSession();
      }
    },
    [location, navigate, store],
  );

  if (isMobile) {
    return (
      <Stack
        direction="column"
        justifyContent={isGame ? 'center' : 'flex-start'}
        alignItems="stretch"
        padding={2}
        height="100vh"
        spacing={9}
      >
        {isGame || Boolean(skipLoginIntro) ? null : <ArrowBackIosIcon onClick={() => navigate(-1)} />}
        <Stack direction="column" textAlign="justify">
          <LoginPage variant={variant} onRequestLogin={handleLoginRequest} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      justifyContent={isGame ? 'center' : 'flex-start'}
      alignItems="stretch"
      padding={2}
      height="100vh"
    >
      {isGame ? null : <ArrowBackIosIcon onClick={() => navigate(-1)} />}
      <Stack direction="row" justifyContent="center" alignItems="center" padding={2} height="100vh">
        <Stack width={375}>
          <LoginPage variant={variant} onRequestLogin={handleLoginRequest} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default observer(AuthorizeLogin);
