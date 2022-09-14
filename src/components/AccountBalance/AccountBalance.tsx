import { observer } from 'mobx-react-lite';
import { Typography, TypographyProps } from '@cere-wallet/ui';

import { useBalanceStore } from '~/hooks';

export type AccountBalanceProps = TypographyProps;

export const AccountBalance = (props: AccountBalanceProps) => {
  const { balance, selectedToken } = useBalanceStore();

  return (
    <Typography {...props}>
      {balance || 0} {selectedToken.displayName}
    </Typography>
  );
};

export default observer(AccountBalance);
