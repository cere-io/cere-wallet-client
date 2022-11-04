import { Stack, styled, Divider, TextField, SearchIcon, Grid, Typography, NoCollectiblesIcon } from '@cere-wallet/ui';
import { useState } from 'react';
import { useCollectiblesStore } from '~/hooks/useCollectiblesStore';
import { CollectibleListItem } from './';
import { useLocation, useNavigate } from 'react-router-dom';

const Container = styled(Stack)(({ theme }) => ({
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
}));

const SearchField = styled(TextField)(({ theme }) => ({
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

export const CollectibleListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const collectiblesStore = useCollectiblesStore();
  const [searchValue, setSearchValue] = useState<string>('');

  const onSearchHandler = (searchText: string) => {
    setSearchValue(searchText);
    collectiblesStore.filter = searchText;
  };

  const openCollectionItemHandler = (id: string) => {
    navigate({ ...location, pathname: `${id}` });
  };

  if (collectiblesStore.nfts.length === 0)
    return (
      <Stack alignItems="center" spacing={2}>
        <NoCollectiblesIcon style={{ height: 80, width: 155 }} />
        <Typography variant="h4">You have no collectibles yet</Typography>
        <Typography variant="body2">Add your first collectible</Typography>
      </Stack>
    );

  return (
    <Container spacing={2} textAlign="justify">
      <Stack padding={2}>
        <SearchField
          value={searchValue}
          variant="outlined"
          label="Search collectibles"
          InputProps={{
            endAdornment: <SearchIcon style={{ position: 'absolute', left: 16 }} width={16} height={16} />,
          }}
          onChange={({ target }) => onSearchHandler(target?.value)}
        />
      </Stack>
      <Divider style={{ width: '100%' }} />
      <Grid container spacing={0} columns={{ xs: 2, sm: 3, md: 4 }}>
        {collectiblesStore.filteredNfts.map((nft) => (
          <Grid item xs={1} key={nft.nftId} style={{ padding: 8 }}>
            <CollectibleListItem
              imgUrl={nft.previewUrl || 'emptyurl'}
              title={nft.title}
              description={nft.description}
              onClick={() => openCollectionItemHandler(nft.nftId)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
