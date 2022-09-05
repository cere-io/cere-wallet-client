import { observer } from 'mobx-react-lite';
import { Stack, useIsMobile } from '@cere-wallet/ui';

import { AccountBalanceWidget } from '~/components';

const WalletHome = () => {
  const isMobile = useIsMobile();

  return (
    <Stack spacing={4}>
      <AccountBalanceWidget title="Coins" dense={isMobile} />
    </Stack>
  );
};

export default observer(WalletHome);
