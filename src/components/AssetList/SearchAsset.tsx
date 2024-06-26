import { InputAdornment, SearchIcon, TextField } from '@cere-wallet/ui';
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
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
      size="small"
      fullWidth
      placeholder="Search asset"
      onChange={handleChange}
    />
  );
};
