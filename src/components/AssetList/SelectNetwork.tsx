import { FC } from 'react';
import { MenuItem, Select } from '@cere-wallet/ui';
import { MATIC_PLATFORMS } from '~/stores';

interface SelectNetworkProps {
  onChange: (value: string) => void;
}

const networkList = [{ value: MATIC_PLATFORMS.POLIGON, name: 'Polygon' }];

export const SelectNetwork: FC<SelectNetworkProps> = ({ onChange }) => {
  const handleChange = (item: Record<string, any>) => {
    onChange(item.value);
  };

  return (
    <Select fullWidth placeholder="network" size="small" defaultValue={MATIC_PLATFORMS.POLIGON} onChange={handleChange}>
      {networkList.map((item) => (
        <MenuItem key={item.name} value={item.value}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
