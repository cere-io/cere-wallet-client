import { useCallback, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { ArrowBackIosIcon, Box, LoadingButton, CereIcon, Stack, Typography } from '@cere-wallet/ui';

import { AuthorizePopupStore } from '~/stores';
import { Permissions } from '~/components';
import { reportError } from '~/reporting';

const AuthorizePermissions = () => {
  const store = useOutletContext<AuthorizePopupStore>();
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
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
    <Stack padding={2}>
      <ArrowBackIosIcon onClick={() => navigate(-1)} />

      <Stack paddingTop={9} spacing={3}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h2" flex={1}>
            Permissions
          </Typography>
          <CereIcon />
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
    </Stack>
  );
};

export default observer(AuthorizePermissions);
