import { Address, CopyButton, IconButton, Stack, Typography } from '@cere-wallet/ui';
import { Paper } from '@cere/ui';
import { AddressQRButton } from '~/components';
import { CoinIcon } from '~/components/CoinIcon';

interface WalletAddressProps {
  address: string;
}

export const WalletAddress = ({ address }: WalletAddressProps) => {
  if (!address) {
    return <></>;
  }

  return (
    <Paper variant="outlined" sx={{ padding: 2 }}>
      <Typography fontWeight="bold">Wallet address (ERC 20)</Typography>

      <Stack direction="row" spacing={1} alignItems="center">
        <Typography flex={1} color="text.secondary" noWrap={true}>
          <Address variant="text" address={address} />
        </Typography>
        <CopyButton value={address} variant="outlined" successMessage="Address copied" />
        <AddressQRButton address={address} variant="outlined" />
      </Stack>
      <Stack direction="row" spacing={1} marginTop={1}>
        <IconButton variant="filled" size="small" disableRipple>
          <CoinIcon coin="eth" />
        </IconButton>

        <IconButton variant="filled" size="small" disableRipple>
          <CoinIcon coin="matic" />
        </IconButton>

        <IconButton variant="filled" size="small" disableRipple>
          <CoinIcon coin="usdc" />
        </IconButton>
      </Stack>
    </Paper>
  );
};
