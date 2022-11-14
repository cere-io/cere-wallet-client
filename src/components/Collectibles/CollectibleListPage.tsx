import { Stack, styled, Divider, TextField, SearchIcon, Typography, NoCollectiblesIcon } from '@cere-wallet/ui';
import { useCollectiblesStore } from '~/hooks/useCollectiblesStore';
import { CollectibleListItem } from './';
import { useLocation, useNavigate } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { Box } from '@cere/ui';

const Container = styled(Stack)(({ theme }) => ({
  borderRadius: 16,
  border: `0.063rem solid ${theme.palette.divider}`,
}));

const SearchField = styled(TextField)(() => ({
  '& fieldset': {
    borderRadius: 100,
  },
  '& input': {
    marginLeft: 34,
  },
  '& label': {
    paddingLeft: 34,
  },
  '& .MuiInputLabel-shrink': {
    paddingLeft: 0,
  },
  '& div:last-child': {
    border: 'none',
  },
}));

const GridContainer = styled(Box)(({ theme }) => ({
  gridTemplateColumns: 'repeat(2, calc(50% - 0.25rem))',
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(3, calc(33.33% - 0.313rem))',
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, calc(25% - 0.375rem))',
  },
}));

export const CollectibleListPage = observer(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const collectiblesStore = useCollectiblesStore();

  const onSearchHandler = (searchText: string) => {
    collectiblesStore.filter = searchText;
  };

  const openCollectionItemHandler = (id: string) => {
    navigate({ ...location, pathname: `${id}` });
  };

  if (collectiblesStore.nfts.length === 0)
    return (
      <Stack alignItems="center" spacing={2}>
        <NoCollectiblesIcon sx={{ height: 80, width: 155 }} />
        <Typography variant="h4">You have no collectibles yet</Typography>
        <Typography variant="body2">Add your first collectible</Typography>
      </Stack>
    );

  return (
    <Container spacing={2} textAlign="justify">
      <Stack padding={2}>
        <SearchField
          value={collectiblesStore.filter}
          variant="outlined"
          label="Search collectibles"
          InputProps={{
            endAdornment: <SearchIcon sx={{ position: 'absolute', left: 16 }} width={16} height={16} />,
          }}
          onChange={({ target }) => onSearchHandler(target?.value)}
        />
      </Stack>
      <Divider sx={{ width: '100%' }} />
      <GridContainer display="grid" padding={1} gap={1}>
        {collectiblesStore.filteredNfts.map((nft) => (
          <Box key={nft.nftId}>
            <CollectibleListItem
              imgUrl={nft.previewUrl}
              title={nft.title}
              description={nft.description}
              onClick={() => openCollectionItemHandler(nft.nftId)}
            />
          </Box>
        ))}
      </GridContainer>
    </Container>
  );
});
