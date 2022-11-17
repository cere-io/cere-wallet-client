import { observer } from 'mobx-react-lite';
import { Address, CopyButton, IconButton, Stack, Typography, useIsMobile } from '@cere-wallet/ui';
import { useAccountStore } from '~/hooks';
import { Alert, Link, Paper } from '@cere/ui';
import { AddressQRButton, FAQ } from '~/components';
import { CoinIcon } from '~/components/CoinIcon';
import { useAlertVisible } from '~/routes/TopUp/useAlertVisible';

const AssetReceivePage = () => {
  const isMobile = useIsMobile();
  const { account } = useAccountStore();
  const [isAlertVisible, hideAlert] = useAlertVisible('assetReceiveTopAlert');

  if (!account) {
    return <></>;
  }

  return (
    <Stack display="grid" gridTemplateColumns="repeat(9, 1fr)" rowGap={2} columnGap={4}>
      <Stack gridColumn={isMobile ? '1/10' : '1/6'} spacing={1}>
        {isAlertVisible && (
          <Alert severity="info" color="neutral" onClose={hideAlert}>
            Fund your wallet with USDC. Send USDC from an exchange or other wallet via{' '}
            <Link target="_blank" href="https://polygon.technology/">
              Polygon network
            </Link>{' '}
            to this wallet address.
          </Alert>
        )}
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
      </Stack>
      <Stack gridColumn={isMobile ? '1/10' : '6/10'} spacing={3}>
        <FAQ title="FAQ">
          <FAQ.Section title="How to fund my wallet by sending USDC?">
            Fund your wallet with USDC. Send USDC from an exchange or other wallet via{' '}
            <Link target="_blank" href="https://polygon.technology/">
              Polygon network
            </Link>{' '}
            to this wallet address.
          </FAQ.Section>

          <FAQ.Section title="What address should I use?">
            Polygon address is an ERC20 address which can be used for any ERC20 network like Polygon network or
            Ethereum.
          </FAQ.Section>

          <FAQ.Section title="How can I buy USDC?">
            Buy USDC on Polygon network directly via an exchange and send the funds to this wallet address. Or buy USDC
            on Ethereum network and use the{' '}
            <Link target="_blank" href="https://wallet.polygon.technology/bridge/">
              Polygon bridge
            </Link>{' '}
            to bridge the funds from Ethereum network to Polygon network. After which you can send the funds to this
            wallet address on Polygon network.
          </FAQ.Section>
        </FAQ>
      </Stack>
    </Stack>
  );
};

export default observer(AssetReceivePage);
