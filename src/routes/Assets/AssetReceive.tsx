import { observer } from 'mobx-react-lite';
import { Stack, Typography, useIsMobile } from '@cere-wallet/ui';
import { AssetReceiveFaq, AssetReceiveTopAlert, WalletAddress } from '~/components';
import { useAccountStore } from '~/hooks';

const AssetReceive = () => {
  const isMobile = useIsMobile();
  const { account } = useAccountStore();

  if (!account) {
    return <></>;
  }

  return (
    <Stack display="grid" gridTemplateColumns="repeat(9, 1fr)" rowGap={2} columnGap={4}>
      <Stack gridColumn={isMobile ? '1/10' : '1/6'} spacing={1}>
        <AssetReceiveTopAlert />
        <Typography fontWeight="bold">Copy address</Typography>
        <WalletAddress address={account.address} />
      </Stack>
      <Stack gridColumn={isMobile ? '1/10' : '6/10'} spacing={3}>
        <AssetReceiveFaq />
      </Stack>
    </Stack>
  );
};

export default observer(AssetReceive);
