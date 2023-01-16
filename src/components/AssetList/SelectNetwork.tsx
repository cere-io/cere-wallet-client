import { FC } from 'react';
import { EthIcon, Stack, Box, MenuItem, Select, SelectProps } from '@cere-wallet/ui';
import { NETWORKS_LIST } from '~/stores';

const [ETHEREUM] = NETWORKS_LIST;

const ICONS = {
  [ETHEREUM.name]: <EthIcon />,
};

interface SelectNetworkProps extends SelectProps {
  showIcon?: boolean;
}

export const SelectNetwork: FC<SelectNetworkProps> = ({ showIcon, onChange, size, ...props }) => {
  return (
    <Select {...props} size={size} fullWidth placeholder="network" defaultValue={ETHEREUM} onChange={onChange}>
      {NETWORKS_LIST.map((item) => (
        <MenuItem key={item.name} value={item.value}>
          <Stack direction="row" alignItems="center" justifyContent="flex-start" gap={1}>
            {showIcon && <span>{ICONS[item.name]}</span>}
            <span>{item.name}</span>
          </Stack>
        </MenuItem>
      ))}
    </Select>
  );
};
