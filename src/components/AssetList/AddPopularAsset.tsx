import { useMemo, FC, useState } from 'react';
import {
  Box,
  Stack,
  Button,
  AddIcon,
  ListItem as ListItemComponent,
  List,
  styled,
  Loading,
  Typography,
} from '@cere-wallet/ui';
import { useAssetStore, usePopularAssets, useSearchAssets } from '~/hooks';
import { Asset } from '~/stores';
import CustomListItem from './CustomListItem';
import { SearchAsset } from './SearchAsset';
import { SwitchNetwork } from './SwitchNetwork';

interface AddPopularAssetProps {
  changeStep: VoidFunction;
}

const StyledList = styled(List)(() => ({
  paddingLeft: 0,
  paddingRight: 0,
}));

const ListItem = styled(ListItemComponent)(() => ({
  paddingRight: 24,
  paddingLeft: 24,
}));

export const AddPopularAsset: FC<AddPopularAssetProps> = ({ changeStep }) => {
  const { search, setSearch, data: searchData } = useSearchAssets();
  const { data: popularList, isLoading: isLoadingPopular } = usePopularAssets();

  const [network, setNetwork] = useState('');
  const assetStore = useAssetStore();

  const { list, managableList: tokensList } = assetStore;

  const managableList = useMemo(
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

  return (
    <Box>
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
        <>
          {list.map((asset) => (
            <CustomListItem disableGutters divider hideEdit key={asset.displayName} added asset={asset} />
          ))}
          {managableList.map((asset) => (
            <CustomListItem disableGutters divider key={asset.displayName} added asset={asset} />
          ))}
        </>
        <ListItem disableGutters divider>
          <Stack sx={{ width: '100%' }} direction="column" marginBottom={1} marginTop={1} gap={1}>
            <Button
              onClick={changeStep}
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
    </Box>
  );
};
