import { FC } from 'react';
import { MenuItem, Select, SelectProps } from '@cere-wallet/ui';
import { MATIC_PLATFORMS } from '~/stores';

const networkList = [{ value: MATIC_PLATFORMS.POLIGON, name: 'Polygon' }];

export const SelectNetwork: FC<SelectProps> = ({ onChange }) => {
  return (
    <Select fullWidth placeholder="network" size="small" defaultValue={MATIC_PLATFORMS.POLIGON} onChange={onChange}>
      {networkList.map((item) => (
        <MenuItem key={item.name} value={item.value}>
          {item.name}
        </MenuItem>
      ))}
    </Select>
  );
};
