import { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { AddressDropdown as UIAddressDropdown, AddressDropdownProps as UIAddressDropdownProps } from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';
import { CoinIcon } from '../CoinIcon';

export type AddressDropdownProps = Pick<UIAddressDropdownProps, 'variant' | 'size' | 'maxLength'>;

const labelByType = {
  ethereum: 'Polygon',
  ed25519: 'Cere Network',
  solana: 'Solana',
};

const iconByType = {
  ethereum: 'matic',
  ed25519: 'cere',
  solana: 'solana',
};

const AddressDropdown = (props: AddressDropdownProps) => {
  const store = useAccountStore();
  const { selectedAccount, accounts } = store;
  const handleChange: UIAddressDropdownProps['onChange'] = useCallback(
    ({ address }) => store.selectAccount(address),
    [store],
  );

  const options = useMemo(
    () =>
      accounts.map((account) => ({
        address: account.address,
        label: labelByType[account.type],
        icon: <CoinIcon coin={iconByType[account.type]} />,
      })),
    [accounts],
  );

  if (!selectedAccount) {
    return null;
  }

  return <UIAddressDropdown {...props} address={selectedAccount.address} options={options} onChange={handleChange} />;
};

export default observer(AddressDropdown);
