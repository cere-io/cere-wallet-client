import { Typography, Grid, Stack, TransferIcon, CardMedia } from '@cere-wallet/ui';
import { useCollectiblesStore } from '~/hooks/useCollectiblesStore';
import { Button, Divider, styled } from '@cere/ui';

type CollectibleItemProps = {
  nftId: string;
};

const TableItem = styled(Typography)(({ theme }) => ({
  padding: 8,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

const TableContainer = styled(Grid)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
}));

export const CollectibleItemPage = ({ nftId }: CollectibleItemProps) => {
  const collectiblesStore = useCollectiblesStore();
  const nft = collectiblesStore.getNftById(nftId);

  return (
    <>
      <Typography variant="h4">{nft?.title}</Typography>
      <Grid container spacing={2} columns={{ xs: 1, md: 7 }}>
        <Grid item xs={1} md={3}>
          <Stack spacing={2}>
            <CardMedia
              component="img"
              src={nft?.previewUrl}
              style={{ borderRadius: 16, maxHeight: 424 }}
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
          <TableContainer container padding={2} spacing={0} columns={{ xs: 5 }}>
            {nft?.collectionAddress && (
              <>
                <Grid item xs={2} component={TableItem} variant="body1" fontWeight="medium" color="text.secondary">
                  Collection
                </Grid>
                <Grid item xs={3} component={TableItem} variant="subtitle1">
                  {nft?.collectionName}
                </Grid>
                <Grid item xs={2} component={TableItem} variant="body1" fontWeight="medium" color="text.secondary">
                  Collectible contract address
                </Grid>
                <Grid item xs={3} component={TableItem} variant="subtitle1">
                  {nft?.collectionAddress}
                </Grid>
              </>
            )}
            <Grid item xs={2} component={TableItem} variant="body1" fontWeight="medium" color="text.secondary">
              Token ID
            </Grid>
            <Grid item xs={3} component={TableItem} variant="subtitle1">
              26
            </Grid>

            <Grid item xs={2} component={TableItem} variant="body1" fontWeight="medium" color="text.secondary">
              Quantity
            </Grid>
            <Grid item xs={3} component={TableItem} variant="subtitle1">
              {nft?.quantity}
            </Grid>

            <Grid item xs={2} component={TableItem} variant="body1" fontWeight="medium" color="text.secondary">
              Token standard
            </Grid>
            <Grid item xs={3} component={TableItem} variant="subtitle1">
              ERC721
            </Grid>
            <Grid item xs={2} component={TableItem} variant="body1" fontWeight="medium" color="text.secondary">
              Network
            </Grid>
            <Grid item xs={3} component={TableItem} variant="subtitle1">
              Polygon Mainnet
            </Grid>
            <Grid item xs={5} component={TableItem}>
              <Divider style={{ width: '100%' }} />
            </Grid>
            <Grid item xs={5} component={TableItem} variant="body2" color="primary.main">
              View in Marketplace
            </Grid>
          </TableContainer>
        </Grid>
      </Grid>
    </>
  );
};
