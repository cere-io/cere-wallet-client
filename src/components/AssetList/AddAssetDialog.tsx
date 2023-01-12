import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Stack,
  Select,
  Button,
  AddIcon,
  ListItem,
  IconButton,
  TextField,
  useIsMobile,
  List,
} from '@cere-wallet/ui';
import { Typography } from '@mui/material';
import { ArrowLeftIcon } from 'packages/ui/src/icons/ArrowLeftIcon';
import React, { FC, useState } from 'react';
import { useAssetStore } from '~/hooks';
import { Asset } from '~/stores';
import CustomListItem from './CustomListItem';
import { SearchAsset } from './SearchAsset';
import { SwitchNetwork } from './SwitchNetwork';

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddAssetDialog: FC<AddAssetDialogProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Partial<Asset>>({});
  const [network, setNetwork] = useState('');
  const [search, setSearch] = useState('');
  const assetStore = useAssetStore();

  const onSubmit = useCallback(
    (asset: Asset) => {
      assetStore.addAsset(asset);
    },
    [assetStore],
  );

  const { list, popularList } = assetStore;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form as Asset);
  };

  const handleGoCustomStep = () => {
    setStep(1);
  };

  const handleGoList = () => {
    setStep(0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleChangeNetwork = (item: any) => {
    setForm((prevForm) => ({ ...prevForm, network: item }));
  };

  return (
    <Dialog fullScreen={isMobile} fullWidth open={open} onClose={onClose}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          {step === 0 && (
            <>
              <Stack marginBottom={1} gap={0}>
                <Typography variant="h3">Add asset</Typography>
              </Stack>
              <List variant="outlined">
                <ListItem divider>
                  <Stack direction="row" sx={{ width: '100%' }} alignItems="space-between" marginBottom={3} gap={2}>
                    <SearchAsset onChange={setSearch} />
                    <SwitchNetwork onChange={setNetwork} />
                  </Stack>
                </ListItem>
                {list.map((asset) => (
                  <CustomListItem divider key={asset.displayName} added asset={asset} />
                ))}
                <ListItem divider>
                  <Stack sx={{ width: '100%' }} direction="column" marginBottom={3} gap={1}>
                    <Button
                      onClick={handleGoCustomStep}
                      type="button"
                      startIcon={<AddIcon />}
                      fullWidth
                      variant="outlined"
                    >
                      Add custom asset
                    </Button>
                    <Typography variant="body2" marginTop={2} color="text.secondary" fontWeight="bold">
                      Popular coins
                    </Typography>
                  </Stack>
                </ListItem>
                {popularList.map((asset) => (
                  <CustomListItem key={asset.displayName} asset={asset} divider />
                ))}
              </List>
            </>
          )}
          {step === 1 && (
            <>
              <Stack alignItems="center" marginBottom={3}>
                <Stack direction="row" gap={1}>
                  <IconButton onClick={handleGoList}>
                    <ArrowLeftIcon />
                  </IconButton>
                  <Typography variant="h3">Add custom asset</Typography>
                </Stack>
                <Stack spacing={2} alignItems="center" marginTop={3} marginBottom={6}>
                  <Select label="network" onChange={handleChangeNetwork} />
                  <TextField label="Token contract address" onChange={handleChange} />
                  <TextField label="Token symbol" onChange={handleChange} />
                  <TextField label="Token name" onChange={handleChange} />
                  <TextField label="Decimals of precision" onChange={handleChange} />
                </Stack>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between" marginBottom={3} gap={1}>
                <Button fullWidth type="button" onClick={onClose} variant="outlined">
                  Cancel
                </Button>
                <Button fullWidth type="submit" variant="contained">
                  Add
                </Button>
              </Stack>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
