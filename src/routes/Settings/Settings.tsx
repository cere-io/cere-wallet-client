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
  TextField,
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
  whiteSpace: 'nowrap',
  height: 42,
}) as typeof Button;

const downloadFile = (url: string, filename: string) => {
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up by revoking the Blob URL
  URL.revokeObjectURL(url);
};

export const Settings = () => {
  const isMobile = useIsMobile();
  const accountStore = useAccountStore();
  const authenticationStore = useAuthenticationStore();
  const { accountUrl } = useOpenLoginStore();
  const [accountLink, setAccountLink] = useState<string>();
  const cereAddress = accountStore.getAccount('ed25519')?.address;
  const [exportPassword, setExportPassword] = useState('');

  const handleExportAccount = () => {
    downloadFile(accountStore.exportAccount('ed25519', exportPassword), `${cereAddress}.json`);
    setExportPassword('');
  };

  const handleExportPrivateKey = () => {
    downloadFile(accountStore.exportPrivateKey(), `${cereAddress}-privateKey.json`);
  };

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
                the OpenLogin settings.
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
            title="Export Your Account as an Encrypted JSON File"
            avatar={
              <IconButton variant="filled" size="medium">
                <DownloadIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack spacing={1}>
              <Typography flex={1} variant="body2" color="text.secondary">
                This downloadable file lets you restore your account or use it with Cere Tools, even if you can't
                connect directly to Cere Wallet. To ensure maximum security, the file will be encrypted with a password
                you create.
              </Typography>

              <Typography flex={1} variant="body2" color="text.secondary">
                Please keep your password confidential and do not share it with anyone. Sharing your password could
                compromise your account security.
              </Typography>

              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} paddingTop={2}>
                <TextField
                  label="Encryption Password"
                  value={exportPassword}
                  fullWidth
                  size="small"
                  type="password"
                  onChange={(event) => setExportPassword(event.target.value)}
                />

                <SectionButton
                  disabled={!cereAddress || !exportPassword}
                  fullWidth={isMobile}
                  variant="contained"
                  onClick={handleExportAccount}
                >
                  Export Account
                </SectionButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
        <Card>
          <SectionHeader
            title="Export Your Private key"
            avatar={
              <IconButton variant="filled" size="medium">
                <DownloadIcon />
              </IconButton>
            }
          />

          <CardContent>
            <Stack spacing={1}>
              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} paddingTop={2}>
                <Typography flex={1} variant="body2" color="text.secondary">
                  This downloadable file contains your private key, which allows you to gain full access to your
                  account.
                </Typography>
                <SectionButton
                  disabled={!cereAddress}
                  fullWidth={isMobile}
                  variant="contained"
                  onClick={handleExportPrivateKey}
                >
                  Export private key
                </SectionButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </>
  );
};
