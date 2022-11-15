import { observer } from 'mobx-react-lite';
import { Stack, Typography, LogoRampIcon, Chip } from '@cere-wallet/ui';
import { useAccountStore } from '~/hooks';
import { Alert, Link } from '@cere/ui';
import { useAlertVisible } from '~/routes/TopUp/useAlertVisible';

const AssetBuyPage = () => {
  const { account } = useAccountStore();
  const [isAlertVisible, hideAlert] = useAlertVisible();

  if (!account) {
    return <></>;
  }

  return (
    <Stack spacing={2}>
      {isAlertVisible && (
        <Alert severity="info" color="neutral" onClose={hideAlert}>
          Buy USDC directly on Polygon Network or{' '}
          <Link target="_blank" href="https://polygon.technology/">
            bridge USDC over to Polygon network
          </Link>{' '}
          from Ethereum ERC20 network.
        </Alert>
      )}
      <Stack spacing={1.5}>
        <Typography fontWeight="bold">Select a Provider</Typography>
      </Stack>
      <Stack spacing={2} sx={{ border: '1px solid red' }}>
        <LogoRampIcon sx={{ height: 24, width: 104 }} />
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Pay with
          </Typography>
          <Typography variant="body2">Credit/debit card/Apple pay/Bank transfer</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Fees
          </Typography>
          <Typography variant="body2">0.49%- 2.9%</Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Limits
          </Typography>
          <Typography variant="body2">5,000€/purchase, 20,000€/mo </Typography>
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">
            Currencies
          </Typography>
          <Typography variant="body2">
            <Chip label="ETH" /> <Chip label="DAI" /> <Chip label="USDC" /> <Chip label="USDT" />
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default observer(AssetBuyPage);
