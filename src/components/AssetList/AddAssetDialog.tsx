import { useMemo } from 'react';
import {
  Box,
  Dialog,
  Divider,
  DialogContent,
  Stack,
  Button,
  AddIcon,
  ListItem,
  IconButton,
  TextField,
  useIsMobile,
  List,
  styled,
} from '@cere-wallet/ui';
import { Typography } from '@mui/material';
import { ArrowLeftIcon } from 'packages/ui/src/icons/ArrowLeftIcon';
import React, { FC, useState } from 'react';
import { useAssetStore } from '~/hooks';
import { Asset } from '~/stores';
import CustomListItem from './CustomListItem';
import { SearchAsset } from './SearchAsset';
import { SwitchNetwork } from './SwitchNetwork';
import { MATIC_PLATFORMS } from '~/stores/ExchangeRatesStore/enums';
import { useSearchAssets } from './useSearchAssets';
import { SelectNetwork } from './SelectNetwork';

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiDialogContent-root': {
    paddingTop: 24,
  },
}));

const Label = styled(Typography)(() => ({
  margin: 0,
}));

const FormItem = styled(Box)(() => ({
  width: '100%',
}));

const Field = styled(TextField)(() => ({
  '& .MuiInputBase-root': {
    height: 48,
  },
}));

export const AddAssetDialog: FC<AddAssetDialogProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const { search, setSearch, data: searchData } = useSearchAssets();

  const [form, setForm] = useState<Asset>({
    address: '',
    ticker: '',
    symbol: '',
    displayName: '',
    network: MATIC_PLATFORMS.POLIGON,
  });

  const [network, setNetwork] = useState('');
  const assetStore = useAssetStore();

  const { list: tokensList, popularList } = assetStore;

  const list = useMemo(
    () =>
      [...tokensList, ...searchData].filter((asset) => {
        let networkMatch = true;
        let searchMatch = true;
        if (network) {
          networkMatch = asset.network === network;
        }
        if (search.length > 0) {
          searchMatch = asset.displayName?.includes(search) || asset.ticker?.includes(search);
        }
        return networkMatch && searchMatch;
      }),
    [search, tokensList, searchData, network],
  );

  const handleSubmit = () => {
    assetStore.addAsset(form);
    onClose();
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

  const isValid = useMemo(
    () => form.decimals && form.decimals >= 0 && form.displayName.length > 0 && form.address && form.address.length > 0,
    [form],
  );

  return (
    <StyledDialog fullScreen={isMobile} open={open} onClose={onClose}>
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
                  <SelectNetwork onChange={handleChangeNetwork} />

                  <FormItem>
                    <Label variant="body2">Token contract address</Label>
                    <Field fullWidth size="small" name="address" onChange={handleChange} />
                  </FormItem>
                  <FormItem>
                    <Label variant="body2">Token symbol</Label>
                    <Field fullWidth size="small" name="symbol" onChange={handleChange} />
                  </FormItem>
                  <FormItem>
                    <Label variant="body2">Token name</Label>
                    <Field fullWidth size="small" name="displayName" onChange={handleChange} />
                  </FormItem>
                  <FormItem>
                    <Label variant="body2">Decimals of precision</Label>
                    <Field fullWidth size="small" name="decimals" onChange={handleChange} />
                  </FormItem>
                </Stack>
              </Stack>
              <Stack
                divider={<Divider />}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                marginBottom={3}
                gap={1}
              >
                <Button fullWidth type="button" onClick={onClose} variant="outlined">
                  Cancel
                </Button>
                <Button fullWidth disabled={!isValid} onClick={handleSubmit} variant="contained">
                  Add
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </DialogContent>
    </StyledDialog>
  );
};
