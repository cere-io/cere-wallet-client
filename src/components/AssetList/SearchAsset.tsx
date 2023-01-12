import { SearchIcon, styled, Input } from '@cere-wallet/ui';
import React, { FC } from 'react';

interface SearchAssetProps {
  onChange: (value: string) => void;
}

const StyledInput = styled(Input)(({ theme }) => ({
  inputBase: {
    height: 48,
  },
}));

export const SearchAsset: FC<SearchAssetProps> = ({ onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };

  return <StyledInput startAdornment={<SearchIcon />} fullWidth placeholder="Search asset" onChange={handleChange} />;
};
