import { Dialog, DialogContent, Stack, Button } from '@cere-wallet/ui';
import { Typography } from '@mui/material';
import React, { FC, useState } from 'react';
import { Asset } from '~/stores';

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (asset: Asset) => void;
}

export const AddAssetDialog: FC<AddAssetDialogProps> = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState<Partial<Asset>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form as Asset);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Stack alignItems="center" marginBottom={3}>
            <Typography variant="h3">Your public address</Typography>

            <Stack spacing={2} alignItems="center" marginTop={3} marginBottom={6}></Stack>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="space-between" marginBottom={3} gap={1}>
            <Button fullWidth type="button" onClick={onClose} variant="outlined">
              Cancel
            </Button>
            <Button fullWidth type="submit" variant="contained">
              Add
            </Button>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
};
