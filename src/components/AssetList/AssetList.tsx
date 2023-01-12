import { observer } from 'mobx-react-lite';
import { Button, List, ListItem, ListNoItems, NoCoinsIcon, useIsMobile } from '@cere-wallet/ui';
import { useAssetStore } from '~/hooks';
import AssetListItem from './AssetListItem';
import { useCallback, useState } from 'react';
import { ManageAssetsIcon } from 'packages/ui/src/icons/ManageAssetsIcon';
import { AddAssetDialog } from './AddAssetDialog';
import { Asset } from '~/stores';
import { useNavigate } from 'react-router-dom';

export type AssetListProps = {
  dense?: boolean;
};

const AssetList = ({ dense }: AssetListProps) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const assetStore = useAssetStore();

  const { list } = assetStore;

  const handleShow = useCallback(() => {
    if (isMobile) {
      navigate('wallet/home/assets/management');
    } else {
      setOpen(true);
    }
  }, [setOpen, isMobile, navigate]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <>
      <List dense={dense} variant="outlined">
        {list.map((asset, index) => (
          <AssetListItem key={asset.ticker} divider={list.length !== index + 1} asset={asset} />
        ))}

        {!list.length && (
          <ListNoItems
            icon={<NoCoinsIcon fontSize="inherit" />}
            title="Assets not found"
            description="Add assets to your overview to see the balance and activity"
          />
        )}
        <ListItem sx={{ justifyContent: 'center' }}>
          <Button onClick={handleShow} startIcon={<ManageAssetsIcon />} variant="outlined">
            Manage assets
          </Button>
        </ListItem>
      </List>
      <AddAssetDialog open={open} onClose={handleClose} />
    </>
  );
};

export default observer(AssetList);
