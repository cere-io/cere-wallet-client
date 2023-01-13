import { useMemo, FC, useState } from 'react';
import {
  Box,
  Dialog,
  Divider,
  DialogContent,
  Stack,
  Button,
  AddIcon,
  ListItem as ListItemComponent,
  IconButton,
  TextField,
  useIsMobile,
  List,
  styled,
  Loading,
  Typography,
  ArrowLeftIcon,
} from '@cere-wallet/ui';
import { useAssetStore, usePopularAssets, useSearchAssets } from '~/hooks';
import { Asset } from '~/stores';
import CustomListItem from './CustomListItem';
import { SearchAsset } from './SearchAsset';
import { SwitchNetwork } from './SwitchNetwork';
import { MATIC_PLATFORMS } from '~/stores/ExchangeRatesStore/enums';
import { SelectNetwork } from './SelectNetwork';

interface AddAssetDialogProps {
  open: boolean;
  onClose: () => void;
}

const StyledDialog = styled(Dialog)(() => ({
  '& .MuiBox-root .MuiDialogContent-root': {
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

const StyledList = styled(List)(() => ({
  paddingLeft: 0,
  paddingRight: 0,
}));

const ListItem = styled(ListItemComponent)(() => ({
  paddingRight: 24,
  paddingLeft: 24,
}));

const Container = styled(Box)(() => ({
  width: 416,
  marginLeft: 'auto',
  marginRight: 'auto',
}));

export const AddAssetDialog: FC<AddAssetDialogProps> = ({ open, onClose }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const { search, setSearch, data: searchData } = useSearchAssets();
  const { data: popularList, isLoading: isLoadingPopular } = usePopularAssets();

  const [form, setForm] = useState<Asset>({
    address: '',
    ticker: '',
    symbol: '',
    displayName: '',
    network: MATIC_PLATFORMS.POLIGON,
  });

  const [network, setNetwork] = useState('');
  const assetStore = useAssetStore();

  const { list: tokensList } = assetStore;

  const handleSubmit = () => {
    assetStore.addAsset(form);
    onClose();
    setStep(0);
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

  const popularRenderList = useMemo(() => {
    return popularList.reduce((acc: Asset[], item) => {
      const presentItem = tokensList.find((el) => el.ticker === item.ticker);
      if (!presentItem) {
        acc.push(item);
      }
      return acc;
    }, []);
  }, [popularList, tokensList]);

  const isValid = useMemo(
    () => form.decimals && form.decimals >= 0 && form.displayName.length > 0 && form.address && form.address.length > 0,
    [form],
  );

  return (
    <StyledDialog fullScreen={isMobile} open={open} onClose={onClose}>
      <DialogContent>
        <Container>
          {step === 0 && (
            <>
              <Stack marginBottom={2} gap={0}>
                <Typography variant="h4">Add asset</Typography>
              </Stack>
              <StyledList variant="outlined">
                <ListItem disableGutters divider>
                  <Stack direction="row" sx={{ width: '100%' }} alignItems="space-between" marginBottom={1} gap={2}>
                    <SearchAsset onChange={setSearch} />
                    <SwitchNetwork onChange={setNetwork} />
                  </Stack>
                </ListItem>
                {list.map((asset) => (
                  <CustomListItem disableGutters divider key={asset.displayName} added asset={asset} />
                ))}
                <ListItem disableGutters divider>
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
                {isLoadingPopular && <Loading />}
                {!isLoadingPopular &&
                  popularRenderList.map((asset) => (
                    <CustomListItem disableGutters key={asset.displayName} asset={asset} divider />
                  ))}
              </StyledList>
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
        </Container>
      </DialogContent>
    </StyledDialog>
  );
};
