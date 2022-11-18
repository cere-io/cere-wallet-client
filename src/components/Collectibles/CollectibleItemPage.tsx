import { observer } from 'mobx-react-lite';
import { Box, CopyButton, NoImageIcon, Stack, Typography, styled, useIsMobile } from '@cere-wallet/ui';
import { PageHeader } from '~/components';
import { useCollectiblesStore } from '~/hooks/useCollectiblesStore';

type CollectibleItemProps = {
  nftId: string;
};

const TableContainer = styled(Box)(({ theme }) => ({
  borderRadius: 16,
  [theme.breakpoints.up('md')]: {
    border: `0.063rem solid ${theme.palette.divider}`,
  },
}));

export const CollectibleItemPage = observer(({ nftId }: CollectibleItemProps) => {
  const collectiblesStore = useCollectiblesStore();
  const nft = collectiblesStore.getNftById(nftId);
  const isMobile = useIsMobile();

  return (
    <>
      <PageHeader title={nft?.title || ''} backUrl="../home/collectibles" />
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={2}>
        <Box gridColumn={isMobile ? '1/8' : '1/4'} gridRow="1">
          {nft?.previewUrl && (
            <Box
              height={isMobile ? 'min(26.5rem, calc(100vw - 4.438rem))' : '100%'}
              sx={{
                borderRadius: 2,
                backgroundImage: `url(${nft?.previewUrl})`,
                backgroundRepeat: 'no-repeat',
                backgroundSize: 'cover',
              }}
            />
          )}
          {!nft?.previewUrl && (
            <Stack
              sx={{ background: '#F5F5F7', borderRadius: 2 }}
              alignItems="center"
              justifyContent="center"
              height={isMobile ? 'min(26.5rem, calc(100vw - 4.438rem))' : '100%'}
            >
              <NoImageIcon sx={{ height: 120, width: 'auto' }} />
            </Stack>
          )}
        </Box>
        <Box gridColumn={isMobile ? '1/8' : '4/8'} gridRow={isMobile ? 3 : 1}>
          <TableContainer display="grid" gridTemplateColumns="repeat(2, 50%)" gap={2} padding={2}>
            {nft?.collectionAddress && (
              <>
                <Typography variant="body1" fontWeight="medium" color="text.secondary">
                  Collection
                </Typography>
                <Typography noWrap={true} variant="subtitle1">
                  {nft?.collectionName}
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="text.secondary">
                  Collectible contract address
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography noWrap={true} variant="subtitle1">
                    {nft?.collectionAddress}
                  </Typography>
                  <CopyButton
                    size="small"
                    value={nft?.collectionAddress}
                    successMessage="Collectible contract address copied"
                  />
                </Stack>
              </>
            )}
            {nft?.nftId && (
              <>
                <Typography variant="body1" fontWeight="medium" color="text.secondary">
                  Nft ID
                </Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography noWrap={true} variant="subtitle1">
                    {nft.nftId}
                  </Typography>
                  <CopyButton size="small" value={nft.nftId} successMessage="Collectible contract address copied" />
                </Stack>
              </>
            )}

            <Typography variant="body1" fontWeight="medium" color="text.secondary">
              Quantity
            </Typography>
            <Typography noWrap={true} variant="subtitle1">
              {nft?.quantity}
            </Typography>

            <Typography variant="body1" fontWeight="medium" color="text.secondary">
              Token standard
            </Typography>
            <Typography noWrap={true} variant="subtitle1">
              ERC20
            </Typography>
            <Typography variant="body1" fontWeight="medium" color="text.secondary">
              Network
            </Typography>
            <Typography noWrap={true} variant="subtitle1">
              Polygon {process.env.REACT_APP_ENV === 'prod' ? 'Mainnet' : 'Testnet'}
            </Typography>
            {/* TODO functionality Will be added in next iteration */}
            {/*<Box component={Divider} gridColumn="span 2" sx={{ width: '100%' }} />*/}
            {/*<Box gridColumn="span 2">*/}
            {/*  <Button variant="text" endIcon={<ExternalLinkIcon />}>*/}
            {/*    View in Marketplace*/}
            {/*  </Button>*/}
            {/*</Box>*/}
          </TableContainer>
        </Box>
        <Box gridColumn={isMobile ? 'span 7' : 'span 3'} gridRow={isMobile ? 2 : 3}>
          <Stack spacing={2}>
            {nft?.description && (
              <>
                <Typography variant="subtitle1">Description</Typography>
                <Typography variant="body2">{nft?.description}</Typography>
              </>
            )}

            {/* TODO functionality Will be added in next iteration */}
            {/*<Button size="large" variant="contained" startIcon={<TransferIcon />}>*/}
            {/*  Transfer*/}
            {/*</Button>*/}
          </Stack>
        </Box>
      </Box>
    </>
  );
});
