import { observer } from 'mobx-react-lite';
import { List, ListNoItems, NoCoinsIcon } from '@cere-wallet/ui';
import { useWalletStore } from '~/hooks';
import AssetListItem from './AssetListItem';

export type AssetListProps = {
  dense?: boolean;
};

const AssetList = ({ dense }: AssetListProps) => {
  const { assetStore } = useWalletStore();
  const { list } = assetStore;

  return (
    <List dense={dense} variant="outlined">
      {list.map((asset, index) => (
        <AssetListItem key={asset.ticker} divider={list.length !== index + 1} asset={asset} />
      ))}

      {!list.length && (
        <ListNoItems
          icon={<NoCoinsIcon fontSize="inherit" />}
          title="Coins not found"
          description="Add coins to your overview to see the balance and activity"
        />
      )}
    </List>
  );
};

export default observer(AssetList);
