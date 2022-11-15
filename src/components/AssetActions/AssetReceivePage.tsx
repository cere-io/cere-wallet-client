import { observer } from 'mobx-react-lite';
import { Address, CopyButton, IconButton, Stack, Typography } from '@cere-wallet/ui';
import { useAccountStore } from '~/hooks';
import { Alert, Link, Paper } from '@cere/ui';
import { AddressQRButton } from '~/components';
import { CoinIcon } from '~/components/CoinIcon';
import { useAlertVisible } from '~/routes/TopUp/useAlertVisible';

const AssetReceivePage = () => {
  const { account } = useAccountStore();
  const [isAlertVisible, hideAlert] = useAlertVisible();

  if (!account) {
    return <></>;
  }

  return (
    <Stack spacing={2}>
      {isAlertVisible && (
        <Alert severity="info" color="neutral" onClose={hideAlert}>
          Fund your wallet with USDC. Send USDC from an exchange or other wallet via{' '}
          <Link target="_blank" href="https://polygon.technology/">
            Polygon network
          </Link>{' '}
          to this wallet address.
        </Alert>
      )}
      <Stack spacing={1.5}>
        <Typography fontWeight="bold">Copy address</Typography>

        <Paper variant="outlined" sx={{ padding: 2 }}>
          <Typography fontWeight="bold">Wallet address (ERC 20)</Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography flex={1} color="text.secondary" noWrap={true}>
              <Address variant="text" address={account.address} />
            </Typography>
            <CopyButton value={account.address} variant="outlined" successMessage="Address copied" />
            <AddressQRButton address={account.address} variant="outlined" />
          </Stack>
          <Stack direction="row" spacing={1} marginTop={1}>
            <IconButton variant="filled" size="small" disableRipple>
              <CoinIcon coin="matic" />
            </IconButton>

            <IconButton variant="filled" size="small" disableRipple>
              <CoinIcon coin="usdc" />
            </IconButton>
          </Stack>
        </Paper>
      </Stack>
    </Stack>
  );
};

export default observer(AssetReceivePage);
