import { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { AddressDropdown as UIAddressDropdown, AddressDropdownProps as UIAddressDropdownProps } from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';
import { CoinIcon } from '../CoinIcon';

export type AddressDropdownProps = Pick<UIAddressDropdownProps, 'variant' | 'size' | 'maxLength'>;

const labelByType = {
  ethereum: 'EVM',
  ed25519: 'Cere Network',
  solana: 'Solana',
};

const iconByType = {
  ethereum: 'cere',
  ed25519: 'cere',
  solana: 'solana',
};

// Polygon EVM is being phased out. The ethereum key still derives in the
// engine (kept for SDK compatibility) but is hidden from the user picker.
const HIDDEN_TYPES = new Set(['ethereum']);

const AddressDropdown = (props: AddressDropdownProps) => {
  const store = useAccountStore();
  const { selectedAccount, accounts } = store;
  const handleChange: UIAddressDropdownProps['onChange'] = useCallback(
    ({ address }) => store.selectAccount(address),
    [store],
  );

  const options = useMemo(
    () =>
      accounts
        .filter((account) => !HIDDEN_TYPES.has(account.type))
        .map((account) => ({
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
