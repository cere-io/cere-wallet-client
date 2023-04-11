import { observer } from 'mobx-react-lite';
import { Button, List, ListItem, ListNoItems, NoCoinsIcon, ManageAssetsIcon, Loading, Stack } from '@cere-wallet/ui';
import { useAssetStore } from '~/hooks';
import AssetListItem from './AssetListItem';
import { useCallback, useState } from 'react';
import { AddAssetDialog } from './AddAssetDialog';
import CustomListItem from './CustomListItem';
import { FEATURE_FLAGS } from '~/constants';

export type AssetListProps = {
  dense?: boolean;
};

const AssetList = ({ dense }: AssetListProps) => {
  const [open, setOpen] = useState(false);
  const assetStore = useAssetStore();

  const { loading, list, managableList } = assetStore;

  console.log({ loading, list, managableList });

  const handleShow = useCallback(() => {
    setOpen(true);
  }, [setOpen]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      {loading ? (
        <Stack alignItems="center" paddingTop={2}>
          <Loading size={32} />
        </Stack>
      ) : (
        <List dense={dense} variant="outlined">
          {list.map((asset, index) => (
            <AssetListItem key={asset.ticker} divider={list.length !== index + 1} asset={asset} />
          ))}
          {managableList.map((asset, index) => (
            <CustomListItem key={asset.ticker} hideEdit divider asset={asset} />
          ))}
          {!list.length && !managableList.length && (
            <ListNoItems
              icon={<NoCoinsIcon fontSize="inherit" />}
              title="Assets not found"
              description="Add assets to your overview to see the balance and activity"
            />
          )}
          {FEATURE_FLAGS.assetsManagement && (
            <ListItem sx={{ justifyContent: 'center', marginTop: 1 }}>
              <Button onClick={handleShow} startIcon={<ManageAssetsIcon />} variant="outlined">
                Manage assets
              </Button>
            </ListItem>
          )}
        </List>
      )}

      <AddAssetDialog open={open} onClose={handleClose} />
    </>
  );
};

export default observer(AssetList);
