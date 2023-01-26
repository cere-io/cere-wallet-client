import { FC } from 'react';
import { EthIcon, Stack, MenuItem, Select, SelectProps, MaticIcon } from '@cere-wallet/ui';
import { NETWORKS_LIST } from '~/stores';

const [ETHEREUM, POLYGON] = NETWORKS_LIST;

const NETWORKS_LIST_INPUT = [POLYGON];

const ICONS = {
  [ETHEREUM.name]: <EthIcon />,
  [POLYGON.name]: <MaticIcon />,
};

interface SelectNetworkProps extends SelectProps {
  showIcon?: boolean;
}

export const SelectNetwork: FC<SelectNetworkProps> = ({ showIcon, onChange, size, ...props }) => {
  return (
    <Select {...props} defaultValue={POLYGON.value} size={size} fullWidth placeholder="network" onChange={onChange}>
      {NETWORKS_LIST_INPUT.map((item) => (
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
