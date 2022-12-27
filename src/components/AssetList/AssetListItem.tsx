import { observer } from 'mobx-react-lite';
import { ListItem, ListItemIcon, ListItemText, ListItemProps } from '@cere-wallet/ui';
import { Asset } from '~/stores';
import { CoinIcon } from '../CoinIcon';
import { useBalanceStore } from '~/hooks';

export type AssetListItemProps = ListItemProps & {
  asset: Asset;
};

export const AssetListItem = ({ asset, ...props }: AssetListItemProps) => {
  const { ticker, displayName, network, balance } = asset;

  const { getUsdBalance } = useBalanceStore();

  return (
    <ListItem {...props}>
      <ListItemIcon inset>
        <CoinIcon coin={ticker} fontSize="inherit" />
      </ListItemIcon>

      <ListItemText primary={displayName} secondary={network} />
      {balance !== undefined && (
        <ListItemText
          align="right"
          primary={+balance.toFixed(2)}
          secondary={`$${getUsdBalance(ticker, balance).toFixed(2)} USD`}
        />
      )}
    </ListItem>
  );
};

export default observer(AssetListItem);
