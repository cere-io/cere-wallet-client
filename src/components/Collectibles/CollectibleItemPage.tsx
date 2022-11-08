import { Typography, Grid, Stack, TransferIcon, CardMedia } from '@cere-wallet/ui';
import { useCollectiblesStore } from '~/hooks/useCollectiblesStore';
import { Button, Divider, styled } from '@cere/ui';
import { observer } from 'mobx-react-lite';

type CollectibleItemProps = {
  nftId: string;
};

const TableContainer = styled(Grid)(({ theme }) => ({
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
}));

export const CollectibleItemPage = observer(({ nftId }: CollectibleItemProps) => {
  const collectiblesStore = useCollectiblesStore();
  const nft = collectiblesStore.getNftById(nftId);

  return (
    <>
      <Grid container spacing={2} columns={{ xs: 1, md: 7 }}>
        <Grid item xs={1} md={7}>
          <Typography variant="h4">{nft?.title}</Typography>
        </Grid>
        <Grid item xs={1} md={3}>
          <Stack spacing={2} sx={{ border: '1px solid red' }}>
            <CardMedia
              component="img"
              src={nft?.previewUrl}
              sx={{ borderRadius: 3, maxHeight: 424 }}
              loading="lazy"
              width="sx"
              // height={164}
              alt={nft?.title}
            />
            <Typography variant="subtitle1">Description</Typography>
            <Typography variant="body2">{nft?.description}</Typography>
            <Button size="large" variant="contained" startIcon={<TransferIcon />}>
              Transfer
            </Button>
          </Stack>
        </Grid>
        <Grid item xs={1} md={4}>
          <TableContainer container spacing={2} padding={2} columns={{ xs: 5 }}>
            {nft?.collectionAddress && (
              <>
                <Grid item xs={2} component={Typography} variant="body1" fontWeight="medium" color="text.secondary">
                  Collection
                </Grid>
                <Grid item xs={3} component={Typography} noWrap={true} variant="subtitle1">
                  {nft?.collectionName}
                </Grid>
                <Grid item xs={2} component={Typography} variant="body1" fontWeight="medium" color="text.secondary">
                  Collectible contract address
                </Grid>
                <Grid item xs={3} component={Typography} noWrap={true} variant="subtitle1">
                  {nft?.collectionAddress}
                </Grid>
              </>
            )}
            <Grid item xs={2} component={Typography} variant="body1" fontWeight="medium" color="text.secondary">
              Nft ID
            </Grid>
            <Grid item xs={3} component={Typography} noWrap={true} variant="subtitle1">
              {nft?.nftId}
            </Grid>

            <Grid item xs={2} component={Typography} variant="body1" fontWeight="medium" color="text.secondary">
              Quantity
            </Grid>
            <Grid item xs={3} component={Typography} noWrap={true} variant="subtitle1">
              {nft?.quantity}
            </Grid>

            <Grid item xs={2} component={Typography} variant="body1" fontWeight="medium" color="text.secondary">
              Token standard
            </Grid>
            <Grid item xs={3} component={Typography} noWrap={true} variant="subtitle1">
              ERC20
            </Grid>
            <Grid item xs={2} component={Typography} variant="body1" fontWeight="medium" color="text.secondary">
              Network
            </Grid>
            <Grid item xs={3} component={Typography} noWrap={true} variant="subtitle1">
              Polygon {process.env.REACT_APP_ENV === 'prod' ? 'Mainnet' : 'Testnet'}
            </Grid>
            <Grid item xs={5} component={Divider} sx={{ width: '100%' }} />
            <Grid item xs={5} component={Typography} variant="body2" color="primary.main">
              View in Marketplace
            </Grid>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
});
