import { useCallback, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { AddressDropdown as UIAddressDropdown, AddressDropdownProps as UIAddressDropdownProps } from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';
import { CoinIcon } from '../CoinIcon';

export type AddressDropdownProps = Pick<UIAddressDropdownProps, 'variant' | 'size' | 'maxLength'>;

const AddressDropdown = (props: AddressDropdownProps) => {
  const { account, accounts } = useAccountStore();
  const handleChange: UIAddressDropdownProps['onChange'] = useCallback(({ address }) => {
    console.log({ address });
  }, []);

  const options = useMemo(
    () =>
      accounts.map((account) => ({
        address: account.address,
        label: account.type === 'ethereum' ? 'Polygon' : 'Cere Network',
        icon: account.type === 'ethereum' ? <CoinIcon coin="matic" /> : <CoinIcon coin="cere" />,
      })),
    [accounts],
  );

  if (!account) {
    return null;
  }

  return <UIAddressDropdown {...props} address={account.address} options={options} onChange={handleChange} />;
};

export default observer(AddressDropdown);
