import React, { FC } from 'react';
import { MenuItem, Select } from '@cere-wallet/ui';
import { MATIC, MUMBAI } from '~/stores/ExchangeRatesStore/enums';

const ALL_NETWORKS = 'All networks';

interface SwitchNetworkProps {
  onChange: (value: string) => void;
}

const networkList = [MATIC, MUMBAI, ALL_NETWORKS];

export const SwitchNetwork: FC<SwitchNetworkProps> = ({ onChange }) => {
  const handleChange = (item: Record<string, any>) => {
    onChange(item.value);
  };

  return (
    <Select fullWidth placeholder="network" size="small" defaultValue={ALL_NETWORKS} onChange={handleChange}>
      {networkList.map((name) => (
        <MenuItem key={name} value={name}>
          {name}
        </MenuItem>
      ))}
    </Select>
  );
};
