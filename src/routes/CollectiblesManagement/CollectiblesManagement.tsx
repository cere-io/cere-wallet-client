import React, { FC, useState, useCallback } from 'react';
import { Box, Stack, Button } from '@cere-wallet/ui';
import {} from '@cere-wallet/ui';
import { Typography } from '@mui/material';
import { useAssetStore } from '~/hooks';
import { Asset } from '~/stores';
import { useNavigate } from 'react-router-dom';

export const CollectiblesManagement: FC = () => {
  const navigate = useNavigate();
  const assetStore = useAssetStore();

  const [form, setForm] = useState<Asset>({
    ticker: '',
    displayName: '',
    network: '',
    balance: 0,
  });

  const handleAddCollectable = useCallback(() => {
    assetStore.addAsset(form);
  }, [assetStore, form]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddCollectable();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleBack = () => {
    navigate(-1);
  };
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Stack alignItems="center" marginBottom={3}>
          <Typography variant="h3">Your public address</Typography>

          <Stack spacing={2} alignItems="center" marginTop={3} marginBottom={6}></Stack>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between" marginBottom={3} gap={1}>
          <Button fullWidth type="button" onClick={handleBack} variant="outlined">
            Cancel
          </Button>
          <Button fullWidth type="submit" variant="contained">
            Add
          </Button>
        </Stack>
      </form>
    </Box>
  );
};
