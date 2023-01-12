import { useMemo } from 'react';
import {
  Box,
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
import { MATIC } from '~/stores/ExchangeRatesStore/enums';

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
}

export const AddAssetDialog: FC<AddAssetDialogProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Asset>({
    ticker: '',
    symbol: '',
    displayName: '',
    network: MATIC,
  });

  const [network, setNetwork] = useState('');
  const [search, setSearch] = useState('');
  const assetStore = useAssetStore();

  const { list: tokensList, popularList } = assetStore;

  const list = useMemo(
    () =>
      tokensList.filter((asset) => {
        let networkMatch = true;
        let searchMatch = true;
        if (network) {
          networkMatch = asset.network === network;
        }
        if (search.length > 0) {
          searchMatch = asset.displayName.includes(search) || asset.ticker.includes(search);
        }
        return networkMatch && searchMatch;
      }),
    [search, tokensList, network],
  );

  const handleSubmit = () => {
    assetStore.addAsset(form);
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
    <Dialog fullScreen={isMobile} open={open} onClose={onClose}>
      <DialogContent>
        <Box sx={{ width: 416 }}>
          {step === 0 && (
            <>
              <Stack marginBottom={2} gap={0}>
                <Typography variant="h4">Add asset</Typography>
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
                  <Stack sx={{ width: '100%' }} direction="column" marginBottom={1} marginTop={1} gap={1}>
                    <Button
                      onClick={handleGoCustomStep}
                      type="button"
                      size="large"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{
                        fontWeight: 'medium',
                      }}
                      variant="outlined"
                    >
                      Add custom asset
                    </Button>
                    <Typography variant="body1" marginTop={2} color="text.secondary" fontWeight="bold">
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
                <Stack sx={{ width: '100%' }} direction="row" alignItems="center" justifyContent="start" gap={1}>
                  <IconButton onClick={handleGoList}>
                    <ArrowLeftIcon />
                  </IconButton>
                  <Typography variant="h4">Add custom asset</Typography>
                </Stack>
                <Stack spacing={2} sx={{ width: '100%' }} alignItems="center" marginTop={3} marginBottom={6}>
                  <SwitchNetwork onChange={handleChangeNetwork} />
                  <TextField
                    fullWidth
                    size="small"
                    name="address"
                    label="Token contract address"
                    onChange={handleChange}
                  />
                  <TextField fullWidth size="small" name="symbol" label="Token symbol" onChange={handleChange} />
                  <TextField fullWidth size="small" name="displayName" label="Token name" onChange={handleChange} />
                  <TextField
                    fullWidth
                    size="small"
                    name="decimals"
                    label="Decimals of precision"
                    onChange={handleChange}
                  />
                </Stack>
              </Stack>
              <Stack direction="row" alignItems="center" justifyContent="space-between" marginBottom={3} gap={1}>
                <Button fullWidth type="button" onClick={onClose} variant="outlined">
                  Cancel
                </Button>
                <Button fullWidth onClick={handleSubmit} variant="contained">
                  Add
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
