import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useState } from 'react';
import { Stack, useIsMobile, useTheme, ArrowBackIosIcon } from '@cere-wallet/ui';

import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { OtpPage } from '~/components';

import { AuthorizePopupStore } from '~/stores';
import { useAppContextStore } from '~/hooks';

type AuthorizeOtpProps = {
  sendOtp?: boolean;
};

const AuthorizeOtp = ({ sendOtp }: AuthorizeOtpProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const [isBusy, setBusy] = useState(false);
  const [autoOtp, setAutoOtp] = useState<string>();
  const store = useOutletContext<AuthorizePopupStore>();
  const { whiteLabel } = useAppContextStore();
  const { isGame } = useTheme();
  const hasBackButton = !isGame && !!location.state?.email;

  if (location.state?.email) {
    store.email = location.state?.email;
  }

  const handleLoginRequest = useCallback(
    async (idToken: string) => {
      setBusy(true);
      const { isNewUser } = await store.login(idToken);

      if (
        whiteLabel?.showLoginComplete === true ||
        whiteLabel?.showLoginComplete === 'always' ||
        (isNewUser && whiteLabel?.showLoginComplete === 'new-wallet')
      ) {
        return navigate({ ...location, pathname: '/authorize/complete' });
      }

      if (store.permissions) {
        return navigate({ ...location, pathname: '/authorize/permissions' });
      }

      await store.acceptSession();
      setBusy(false);
    },
    [location, navigate, store, whiteLabel],
  );

  useEffect(() => {
    if (sendOtp) {
      store.sendOtp();
    }

    return store.waitForAuthLinkToken(async ({ token, code }) => {
      setAutoOtp(code);

      await handleLoginRequest(token);
    });
  }, [handleLoginRequest, sendOtp, store]);

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
        {hasBackButton && <ArrowBackIosIcon onClick={() => navigate(-1)} />}

        <Stack direction="column" textAlign="justify">
          <OtpPage
            code={autoOtp}
            busy={isBusy}
            email={store.email}
            onRequestLogin={handleLoginRequest}
            onRequestResend={() => store.sendOtp()}
          />
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
      {hasBackButton && <ArrowBackIosIcon onClick={() => navigate(-1)} />}

      <Stack direction="row" justifyContent="center" alignItems="center" padding={2} height="100vh">
        <Stack width={375}>
          <OtpPage
            code={autoOtp}
            busy={isBusy}
            email={store.email}
            onRequestLogin={handleLoginRequest}
            onRequestResend={() => store.sendOtp()}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default observer(AuthorizeOtp);
