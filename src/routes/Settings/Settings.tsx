import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  SecurityIcon,
  DownloadIcon,
  KeyIcon,
  VisibilityIcon,
  VisibilityOffIcon,
  WarningIcon,
  ContentCopyIcon,
  CheckIcon,
  Alert,
  Stack,
  Typography,
  styled,
  useIsMobile,
  TextField,
} from '@cere-wallet/ui';
import { useEffect, useMemo, useState } from 'react';

import { PageHeader } from '~/components';
import { useAccountStore, useAuthenticationStore, useOpenLoginStore } from '~/hooks';
import { deriveAllKeys, RevealedKeys } from './exportKeys';
import { loadKeystore, getVaultIdentity, clearVaultIdentity, subscribeVaultIdentity } from '~/api/vault-identity';
import { useSyncExternalStore } from 'react';

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

  const [revealed, setRevealed] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const keys: RevealedKeys | null = useMemo(() => {
    if (!revealed || !accountStore.privateKey) return null;
    try {
      return deriveAllKeys(accountStore.privateKey);
    } catch {
      return null;
    }
  }, [revealed, accountStore.privateKey]);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(label);
      window.setTimeout(() => setCopiedField((c) => (c === label ? null : c)), 1200);
    } catch {
      /* noop */
    }
  };

  useEffect(() => {
    authenticationStore
      .getRedirectUrl({ callbackUrl: accountUrl, forceMfa: true, emailHint: accountStore.user?.email, skipIntro: true })
      .then(setAccountLink);
  }, [authenticationStore, accountUrl, accountStore.user]);

  const overridePub = useSyncExternalStore(
    subscribeVaultIdentity,
    () => getVaultIdentity()?.publicKeyHex ?? null,
    () => null,
  );
  const [keystoreFile, setKeystoreFile] = useState<File | null>(null);
  const [keystorePass, setKeystorePass] = useState('');
  const [keystoreError, setKeystoreError] = useState<string | null>(null);
  const [keystoreLoading, setKeystoreLoading] = useState(false);

  const handleKeystoreLoad = async () => {
    if (!keystoreFile) return;
    setKeystoreError(null);
    setKeystoreLoading(true);
    try {
      const text = await keystoreFile.text();
      const json = JSON.parse(text);
      await loadKeystore(json, keystorePass);
      setKeystorePass('');
      setKeystoreFile(null);
    } catch (err: any) {
      setKeystoreError(err?.message || 'Failed to decrypt keystore — check the passphrase.');
    } finally {
      setKeystoreLoading(false);
    }
  };

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
            title="Use external vault identity"
            avatar={
              <IconButton variant="filled" size="medium">
                <KeyIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Vaults on devnet are keyed to whichever ed25519 pubkey claimed them. If your vault was claimed from a
                separate Polkadot keystore (e.g. the demo address from the GTM integration sheet), upload the encrypted
                JSON + passphrase to use it for vault calls. The keystore stays in memory only — refresh clears it.
              </Typography>

              {overridePub && (
                <Alert severity="success" icon={<CheckIcon fontSize="inherit" />}>
                  Vault calls now use external pubkey{' '}
                  <span style={{ fontFamily: '"JetBrains Mono", ui-monospace, monospace', fontSize: '0.78rem' }}>
                    {overridePub.slice(0, 12)}…{overridePub.slice(-6)}
                  </span>
                </Alert>
              )}

              {keystoreError && <Alert severity="error">{keystoreError}</Alert>}

              <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems={isMobile ? 'stretch' : 'center'}>
                <Button
                  component="label"
                  variant="outlined"
                  size="medium"
                  sx={{ minWidth: 200, justifyContent: 'flex-start' }}
                >
                  {keystoreFile ? keystoreFile.name : 'Choose JSON keystore…'}
                  <input
                    hidden
                    type="file"
                    accept="application/json,.json"
                    onChange={(e) => setKeystoreFile(e.target.files?.[0] ?? null)}
                  />
                </Button>
                <TextField
                  label="Passphrase"
                  value={keystorePass}
                  fullWidth
                  size="small"
                  type="password"
                  onChange={(e) => setKeystorePass(e.target.value)}
                />
              </Stack>

              <Stack direction="row" spacing={1.5}>
                <SectionButton
                  variant="contained"
                  disabled={!keystoreFile || !keystorePass || keystoreLoading}
                  onClick={handleKeystoreLoad}
                >
                  {keystoreLoading ? 'Decrypting…' : overridePub ? 'Replace identity' : 'Use this keystore'}
                </SectionButton>
                {overridePub && (
                  <Button
                    variant="text"
                    onClick={() => {
                      clearVaultIdentity();
                      setKeystoreError(null);
                    }}
                  >
                    Clear override
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <SectionHeader
            title="Reveal Backup Keys & Mnemonic"
            avatar={
              <IconButton variant="filled" size="medium">
                <KeyIcon />
              </IconButton>
            }
          />
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="warning" icon={<WarningIcon fontSize="inherit" />}>
                Anyone with these keys controls your wallet. Never share them, never paste them into a website, and
                store them somewhere only you can reach (password manager or paper backup).
              </Alert>

              {!revealed && (
                <SectionButton
                  fullWidth={isMobile}
                  variant="outlined"
                  onClick={() => setRevealed(true)}
                  startIcon={<VisibilityIcon />}
                >
                  Reveal keys
                </SectionButton>
              )}

              {revealed && keys && (
                <Stack spacing={2}>
                  <KeyRow
                    label="Recovery Phrase (24 words)"
                    value={keys.mnemonic}
                    copied={copiedField === 'mnemonic'}
                    onCopy={() => copy('mnemonic', keys.mnemonic)}
                    multiline
                  />
                  <KeyRow
                    label={`Cere Network · ${keys.cere.address}`}
                    value={keys.cere.secretHex}
                    copied={copiedField === 'cere'}
                    onCopy={() => copy('cere', keys.cere.secretHex)}
                  />
                  <KeyRow
                    label={`EVM · ${keys.evm.address}`}
                    value={keys.evm.privateKeyHex}
                    copied={copiedField === 'evm'}
                    onCopy={() => copy('evm', keys.evm.privateKeyHex)}
                  />
                  <KeyRow
                    label={`Solana · ${keys.solana.address}`}
                    value={keys.solana.secretBase58}
                    copied={copiedField === 'solana'}
                    onCopy={() => copy('solana', keys.solana.secretBase58)}
                  />

                  <SectionButton
                    fullWidth={isMobile}
                    variant="text"
                    onClick={() => setRevealed(false)}
                    startIcon={<VisibilityOffIcon />}
                  >
                    Hide keys
                  </SectionButton>
                </Stack>
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
      </Stack>
    </>
  );
};

type KeyRowProps = {
  label: string;
  value: string;
  copied: boolean;
  onCopy: () => void;
  multiline?: boolean;
};

const KeyRow = ({ label, value, copied, onCopy, multiline }: KeyRowProps) => (
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
      {label}
    </Typography>
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
          fontSize: '0.78rem',
          lineHeight: 1.55,
          letterSpacing: 0,
          padding: '10px 12px',
          backgroundColor: 'grey.100',
          borderRadius: 1.25,
          wordBreak: 'break-all',
          whiteSpace: multiline ? 'normal' : 'nowrap',
          overflow: multiline ? 'visible' : 'auto',
        }}
      >
        {value}
      </Typography>
      <IconButton
        variant="filled"
        size="small"
        color={copied ? 'success' : undefined}
        onClick={onCopy}
        aria-label={`Copy ${label}`}
      >
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Stack>
  </Stack>
);
