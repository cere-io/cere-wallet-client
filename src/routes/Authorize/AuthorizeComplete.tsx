import { observer } from 'mobx-react-lite';
import { useCallback, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowBackIosIcon, LoadingButton, Stack, Typography, useIsMobile } from '@cere-wallet/ui';

import { useAppContextStore } from '~/hooks';
import { PoweredBy } from '~/components';

import { AuthorizePopupStore } from '~/stores';
import { reportError } from '~/reporting';

const AuthorizeComplete = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const location = useLocation();
  const store = useOutletContext<AuthorizePopupStore>();
  const { whiteLabel, app } = useAppContextStore();
  const [isLoading, setLoading] = useState(false);
  const { poweredBySection, title, content } = whiteLabel?.loginCompleteSettings || {};

  const handleContinue = useCallback(async () => {
    if (store.permissions) {
      return navigate({ ...location, pathname: '/authorize/permissions' });
    }

    try {
      setLoading(true);
      await store.acceptSession();
    } catch (error) {
      reportError(error);
      setLoading(false);
    }
  }, [location, navigate, store]);

  return (
    <Stack height="100vh" padding={2}>
      <ArrowBackIosIcon onClick={() => navigate(-1)} />

      <Stack margin={isMobile ? 0 : 'auto'} paddingTop={isMobile ? 9 : 0} spacing={3}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h2" flex={1}>
            {title || 'Congratulations 🎉'}
          </Typography>
        </Stack>

        <Typography variant="body1">
          {content || `You have successfully connected your Cere Wallet to ${app?.name || 'the application'}`}
        </Typography>

        <LoadingButton loading={isLoading} size="large" variant="contained" onClick={handleContinue}>
          Continue
        </LoadingButton>
      </Stack>

      {poweredBySection && <PoweredBy />}
    </Stack>
  );
};

export default observer(AuthorizeComplete);
