import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  SecurityIcon,
  DownloadIcon,
  Stack,
  Typography,
  styled,
  useIsMobile,
} from '@cere-wallet/ui';
import { useEffect, useState } from 'react';

import { PageHeader } from '~/components';
import { useAccountStore, useAuthenticationStore, useOpenLoginStore } from '~/hooks';

const SectionHeader = styled(CardHeader)({
  borderBottom: 'none',
  backgroundColor: 'transparent',
  paddingBottom: 0,
});

const SectionButton = styled(Button)({
  minWidth: 250,
  flexShrink: 0,
}) as typeof Button;

export const Settings = () => {
  const isMobile = useIsMobile();
  const accountStore = useAccountStore();
  const authenticationStore = useAuthenticationStore();
  const { accountUrl } = useOpenLoginStore();
  const [accountLink, setAccountLink] = useState<string>();
  const walletDownloadUrl = accountStore.exportAccount('ed25519');
  const cereAddress = accountStore.getAccount('ed25519')?.address;

  useEffect(() => {
    authenticationStore
      .getRedirectUrl({ callbackUrl: accountUrl, forceMfa: true, emailHint: accountStore.user?.email, skipIntro: true })
      .then(setAccountLink);
  }, [authenticationStore, accountUrl, accountStore.user]);

  return (
    <>
      <PageHeader title="Settings" />

      <Stack maxWidth="md" spacing={2}>
        <Card>
          <SectionHeader
            title="Authentication & Security"
            avatar={
              <IconButton variant="filled" size="medium">
                <SecurityIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={3}>
              <Typography flex={1} variant="body2" color="text.secondary">
                Click the button bellow to manage your Authentication & Security settings and you will be redirecting to
                the OpenLogin settings
              </Typography>

              {accountLink && (
                <SectionButton target="_blank" fullWidth={isMobile} href={accountLink} variant="outlined">
                  Go to OpenLogin settings
                </SectionButton>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <SectionHeader
            title="Account export"
            avatar={
              <IconButton variant="filled" size="medium">
                <DownloadIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack direction={isMobile ? 'column' : 'row'} spacing={3}>
              <Typography flex={1} variant="body2" color="text.secondary">
                Export your wallet account to a JSON file
              </Typography>

              <SectionButton
                disabled={!cereAddress}
                download={`${cereAddress}.json`}
                fullWidth={isMobile}
                href={walletDownloadUrl}
                variant="outlined"
              >
                Download
              </SectionButton>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
};
