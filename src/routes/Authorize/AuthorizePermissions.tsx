import { useCallback, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowBackIosIcon, Box, LoadingButton, CereIcon, Stack, Typography, useIsMobile } from '@cere-wallet/ui';

import { AuthorizePopupStore } from '~/stores';
import { Permissions } from '~/components';
import { reportError } from '~/reporting';
import { useAppContextStore } from '~/hooks';

const AuthorizePermissions = () => {
  const store = useOutletContext<AuthorizePopupStore>();
  const appStore = useAppContextStore();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoading, setLoading] = useState(false);

  const permissionsScreenSettings = appStore.whiteLabel?.permissionsScreenSettings;

  const cereWalletIcon = useMemo(() => {
    if (permissionsScreenSettings?.hideIconInHeader) {
      return;
    }
    return <CereIcon />;
  }, [permissionsScreenSettings?.hideIconInHeader]);

  const poweredBySection = useMemo(() => {
    if (!permissionsScreenSettings?.poweredBySection) {
      return;
    }
    return (
      <Stack spacing={2} marginTop={8} direction="row" alignItems="center" justifyContent="center">
        <Typography sx={{ marginRight: '8px' }} variant="body2" color="text.secondary">
          Powered by Cere Wallet
        </Typography>
        <CereIcon />
      </Stack>
    );
  }, [permissionsScreenSettings?.poweredBySection]);

  const handleContinue = useCallback(async () => {
    try {
      setLoading(true);
      await store.acceptSession();
    } catch (error) {
      reportError(error);
      setLoading(false);
    }
  }, [store]);

  return (
    <Stack height="100vh" padding={2}>
      <ArrowBackIosIcon onClick={() => navigate(-1)} />

      <Stack margin={isMobile ? 0 : 'auto'} paddingTop={isMobile ? 9 : 0} spacing={3}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h2" flex={1}>
            Permissions
          </Typography>
          {cereWalletIcon}
        </Stack>

        <Typography variant="body2" color={'text.secondary'}>
          The application requests the following permissions
        </Typography>

        <Box>
          <Box marginLeft={-1} marginBottom={1}>
            <Permissions
              permissions={store.permissions || {}}
              value={store.acceptedPermissions}
              onChange={(permissions) => {
                store.acceptedPermissions = permissions;
              }}
            />
          </Box>
        </Box>

        <LoadingButton loading={isLoading} size="large" variant="contained" onClick={handleContinue}>
          Continue
        </LoadingButton>
      </Stack>
      {poweredBySection}
    </Stack>
  );
};

export default observer(AuthorizePermissions);
