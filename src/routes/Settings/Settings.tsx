import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  SecurityIcon,
  Stack,
  Typography,
  useIsMobile,
} from '@cere-wallet/ui';
import { useEffect, useState } from 'react';

import { PageHeader } from '~/components';
import { useAccountStore, useAuthenticationStore, useOpenLoginStore } from '~/hooks';

export const Settings = () => {
  const isMobile = useIsMobile();
  const { user } = useAccountStore();
  const { accountUrl } = useOpenLoginStore();
  const authenticationStore = useAuthenticationStore();
  const [accountLink, setAccountLink] = useState<string>();

  useEffect(() => {
    authenticationStore
      .getRedirectUrl({ callbackUrl: accountUrl, forceMfa: true, emailHint: user?.email, skipIntro: true })
      .then(setAccountLink);
  }, [authenticationStore, accountUrl, user]);

  return (
    <>
      <PageHeader title="Settings" />

      <Box maxWidth="md">
        <Card>
          <CardContent>
            <Grid spacing={1} direction="row" alignItems="center" container>
              <Grid item>
                <Box maxWidth="sm">
                  <Stack direction="row" gap={2} alignItems="center">
                    <IconButton variant="filled" size="medium">
                      <SecurityIcon />
                    </IconButton>
                    <Typography variant="body1" fontWeight="semibold">
                      Authentication & Security
                    </Typography>
                  </Stack>
                  <Box marginTop="16px">
                    <Typography variant="body2" color="text.secondary">
                      Click the button bellow to manage your Authentication & Security settings and you will be
                      redirecting to the OpenLogin settings
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid flexGrow={1} marginTop={isMobile ? 3 : 0} item>
                {accountLink && (
                  <Button target="_blank" fullWidth href={accountLink} variant="outlined">
                    Go to OpenLogin settings
                  </Button>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </>
  );
};
