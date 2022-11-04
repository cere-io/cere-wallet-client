import { observer } from 'mobx-react-lite';
import { Typography, TypographyProps } from '@cere-wallet/ui';

import { useBalanceStore } from '~/hooks';

export type AccountBalanceProps = TypographyProps;

export const AccountBalance = (props: AccountBalanceProps) => {
  const { balance, selectedToken } = useBalanceStore();

  return (
    <>
      {/* css class "account-balance" is an anchor for product tour */}
      <Typography {...props} className="account-balance">
        {balance || 0} {selectedToken?.displayName}
      </Typography>
    </>
  );
};

export default observer(AccountBalance);
