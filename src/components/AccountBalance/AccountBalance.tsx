import { observer } from 'mobx-react-lite';
import { Typography, TypographyProps } from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';

export type AccountBalanceProps = TypographyProps;

export const AccountBalance = (props: AccountBalanceProps) => {
  const { balanceStore } = useAccountStore();

  return (
    <Typography {...props}>
      {balanceStore.balance || 0} {balanceStore.selectedToken.displayName}
    </Typography>
  );
};

export default observer(AccountBalance);
