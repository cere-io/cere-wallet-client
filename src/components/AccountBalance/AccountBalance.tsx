import { observer } from 'mobx-react-lite';
import { Typography, TypographyProps } from '@cere-wallet/ui';

import { useBalanceStore } from '~/hooks';

export type AccountBalanceProps = TypographyProps;

export const AccountBalance = (props: AccountBalanceProps) => {
  const { totalUsdBalance } = useBalanceStore();

  return (
    <>
      {/* css class "account-balance" is an anchor for product tour */}
      <Typography {...props} className="account-balance">
        ${totalUsdBalance.toFixed(2) || 0} USD
      </Typography>
    </>
  );
};

export default observer(AccountBalance);
