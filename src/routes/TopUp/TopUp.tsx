import { Address, Alert, CopyButton, IconButton, Paper, Stack, Typography, useIsMobile } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { PageHeader, FAQ, AddressQRButton } from '~/components';
import { CoinIcon } from '~/components/CoinIcon';
import { useAccountStore } from '~/hooks';
import { useAlertVisible } from './useAlertVisible';

const TopUp = () => {
  const isMobile = useIsMobile();
  const { account } = useAccountStore();
  const [isAlertVisible, hideAlert] = useAlertVisible();

  return (
    <>
      <PageHeader title="Top Up" backUrl=".." />

      <Stack spacing={isMobile ? 3 : 8} direction={isMobile ? 'column' : 'row'} alignItems="flex-start">
        <Stack spacing={isMobile ? 3 : 4} flex={3}>
          {isAlertVisible && (
            <Alert severity="info" color="neutral" onClose={hideAlert}>
              Fund your wallet with USDC. Send USDC from an exchange or other wallet via Polygon network to this wallet
              address.
            </Alert>
          )}

          {account && (
            <Stack spacing={1.5}>
              <Typography fontWeight="bold">Copy address</Typography>

              <Paper variant="outlined" sx={{ padding: 2 }}>
                <Typography fontWeight="bold">Wallet address (ERC 20)</Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography flex={1} color="text.secondary">
                    <Address variant="text" address={account.address} maxLength={isMobile ? 24 : undefined} />
                  </Typography>
                  <CopyButton value={account.address} successMessage="Address copied" />
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
          )}
        </Stack>

        <FAQ flex={2} title="FAQ">
          <FAQ.Section defaultExpanded title="How to fund my wallet by sending USDC?">
            Fund your wallet with USDC. Send USDC from an exchange or other wallet via Polygon network to this wallet
            address.
          </FAQ.Section>

          <FAQ.Section defaultExpanded title="What address should I use?">
            Polygon address is an ERC20 address which can be used for any ERC20 network like Polygon network or
            Ethereum.
          </FAQ.Section>

          <FAQ.Section defaultExpanded title="How can I buy USDC?">
            Buy USDC on Polygon network directly via an exchange and send the funds to this wallet address. Or buy USDC
            on Ethereum network and use the Polygon bridge to bridge the funds from Ethereum network to Polygon network.
            After which you can send the funds to this wallet address on Polygon network.
          </FAQ.Section>
        </FAQ>
      </Stack>
    </>
  );
};

export default observer(TopUp);
