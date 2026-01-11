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
  const web3AuthService = useOpenLoginStore();
  const [accountLink, setAccountLink] = useState<string>();
  const cereAddress = accountStore.getAccount('ed25519')?.address;
  const [exportPassword, setExportPassword] = useState('');

  const handleExportAccount = () => {
    downloadFile(accountStore.exportAccount('ed25519', exportPassword), `${cereAddress}.json`);
    setExportPassword('');
  };

  const handleOpenWalletSettings = async () => {
    try {
      await web3AuthService.showWalletUI();
    } catch (error) {
      console.error('Failed to open wallet settings:', error);
      if (web3AuthService.walletServicesUrl) {
        window.open(web3AuthService.walletServicesUrl, '_blank');
      }
    }
  };

  const handleEnableMFA = async () => {
    try {
      await web3AuthService.enableMFA();
    } catch (error) {
      console.error('Failed to enable MFA:', error);
    }
  };

  useEffect(() => {
    const walletServicesUrl = web3AuthService.walletServicesUrl;
    if (walletServicesUrl) {
      setAccountLink(walletServicesUrl);
    }
  }, [web3AuthService]);

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
                Manage your authentication and security settings including multi-factor authentication (MFA). Click
                below to access your Web3Auth wallet settings.
              </Typography>

              <Stack spacing={2} direction={isMobile ? 'column' : 'row'}>
                <SectionButton fullWidth={isMobile} variant="outlined" onClick={handleOpenWalletSettings}>
                  Open Wallet Settings
                </SectionButton>

                <SectionButton fullWidth={isMobile} variant="contained" onClick={handleEnableMFA}>
                  Enable MFA
                </SectionButton>
              </Stack>
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
      </Stack>
    </>
  );
};
