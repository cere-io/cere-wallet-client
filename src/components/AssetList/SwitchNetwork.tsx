import React, { FC } from 'react';
import { MenuItem, Select, styled } from '@cere-wallet/ui';
import { MATIC, MUMBAI } from '~/stores/ExchangeRatesStore/enums';

interface SwitchNetworkProps {
  onChange: (value: string) => void;
}

const StyledSelect = styled(Select)(({ theme }) => ({
  height: 48,
}));

const networkList = [MATIC, MUMBAI];

export const SwitchNetwork: FC<SwitchNetworkProps> = ({ onChange }) => {
  const handleChange = (item: Record<string, any>) => {
    onChange(item.value);
  };

  return (
    <StyledSelect fullWidth placeholder="network" onChange={handleChange}>
      {networkList.map((name) => (
        <MenuItem key={name} value={name}>
          {name}
        </MenuItem>
      ))}
    </StyledSelect>
  );
};
