import React, { FC } from 'react';
import { MenuItem, Select } from '@cere-wallet/ui';
import { MATIC_PLATFORMS } from '~/stores/ExchangeRatesStore/enums';

const ALL_NETWORKS = 'All networks';

interface SwitchNetworkProps {
  onChange: (value: string) => void;
}

const networkList = [
  { value: MATIC_PLATFORMS.POLIGON, name: 'Polygon' },
  { value: ALL_NETWORKS, name: ALL_NETWORKS },
];

export const SwitchNetwork: FC<SwitchNetworkProps> = ({ onChange }) => {
  const handleChange = (item: Record<string, any>) => {
    onChange(item.value);
  };

  return (
    <Select fullWidth placeholder="network" size="small" defaultValue={ALL_NETWORKS} onChange={handleChange}>
      {networkList.map((item) => (
        <MenuItem key={item.name} value={item.value}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
