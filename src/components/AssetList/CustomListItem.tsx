import { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import {
  ListItem as ListItemComponent,
  ListItemIcon,
  ListItemText,
  ListItemProps,
  AddIcon,
  Button,
  RemoveIcon,
  styled,
} from '@cere-wallet/ui';
import { Asset } from '~/stores';
import { CoinIcon } from '../CoinIcon';
import { useBalanceStore } from '~/hooks';

export type CustomListItemProps = ListItemProps & {
  asset: Asset;
  onItemClick?: (asset: Asset) => void;
  added?: boolean;
  hideEdit?: boolean;
};

const ListItem = styled(ListItemComponent)(() => ({
  paddingRight: 24,
  paddingLeft: 24,
}));

const RemoveButton = styled(Button)(() => ({
  backgroundColor: '#FFF2F2',
  color: '#ED2121',
  fontWeight: 'normal',
}));

const AddButton = styled(Button)(() => ({
  backgroundColor: '#F5F1FE',
  color: '#733BF5',
  fontWeight: 'normal',
}));

export const CustomListItem = ({ asset, added = false, onItemClick, hideEdit, ...props }: CustomListItemProps) => {
  const { ticker, displayName, network, balance, type } = asset;
  const { getUsdBalance } = useBalanceStore();

  const handleClick = useCallback(() => {
    onItemClick?.(asset);
  }, [asset, onItemClick]);

  return (
    <ListItem {...props}>
      <ListItemIcon inset>
        <CoinIcon thumb={asset.thumb} coin={ticker} fontSize="inherit" />
      </ListItemIcon>

      <ListItemText primary={displayName?.toLocaleUpperCase()} secondary={`${network} ${type ? ` (${type})` : ''}`} />

      {!hideEdit ? (
        <ListItemText
          align="right"
          primary={
            added ? (
              <RemoveButton variant="contained" onClick={handleClick} startIcon={<RemoveIcon />}>
                Remove
              </RemoveButton>
            ) : (
              <AddButton variant="contained" onClick={handleClick} startIcon={<AddIcon />}>
                Add asset
              </AddButton>
            )
          }
        />
      ) : (
        balance !== undefined && (
          <ListItemText
            align="right"
            primary={+balance.toFixed(2)}
            secondary={`$${getUsdBalance(ticker, balance).toFixed(2)} USD`}
          />
        )
      )}
    </ListItem>
  );
};

export default observer(CustomListItem);
