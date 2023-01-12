import { SearchIcon, TextField } from '@cere-wallet/ui';
import React, { FC } from 'react';

interface SearchAssetProps {
  onChange: (value: string) => void;
}

export const SearchAsset: FC<SearchAssetProps> = ({ onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
  };

  return (
    <TextField
      InputProps={{
        startAdornment: <SearchIcon sx={{ width: 20, height: 20, marginRight: '10px' }} />,
      }}
      size="small"
      fullWidth
      placeholder="Search asset"
      onChange={handleChange}
    />
  );
};
