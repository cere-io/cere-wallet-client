import {
  List,
  ListNoItems,
  NoCoinsIcon,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  // MaticIcon,
} from '@cere-wallet/ui';

export type AssetListProps = {
  dense?: boolean;
};

export const AssetList = ({ dense }: AssetListProps) => {
  return (
    <List dense={dense} variant="outlined">
      {/* <ListItem divider>
        <ListItemIcon inset>
          <MaticIcon fontSize="inherit" />
        </ListItemIcon>

        <ListItemText primary="MATIC" secondary="Polygon" />
        <ListItemText align="right" primary="100" secondary="$6.96 USD" />
      </ListItem> */}

      <ListNoItems
        icon={<NoCoinsIcon fontSize="inherit" />}
        title="Coins not found"
        description="Add coins to your overview to see the balance and activity "
      />
    </List>
  );
};
