import { CereIcon, List, ListItem, ListItemIcon, ListItemText, MaticIcon, UsdcIcon } from '@cere-wallet/ui';

export type AssetListProps = {
  dense?: boolean;
};

export const AssetList = ({ dense }: AssetListProps) => {
  return (
    <List dense={dense} variant="outlined">
      <ListItem divider>
        <ListItemIcon inset>
          <MaticIcon fontSize="inherit" />
        </ListItemIcon>

        <ListItemText primary="MATIC" secondary="Polygon" />
        <ListItemText align="right" primary="100" secondary="$6.96 USD" />
      </ListItem>

      <ListItem divider>
        <ListItemIcon inset>
          <UsdcIcon fontSize="inherit" />
        </ListItemIcon>

        <ListItemText primary="USDC" secondary="Polygon" />
        <ListItemText align="right" primary="100" secondary="$6.96 USD" />
      </ListItem>

      <ListItem>
        <ListItemIcon inset>
          <CereIcon fontSize="inherit" />
        </ListItemIcon>

        <ListItemText primary="CERE" secondary="Polygon" />
        <ListItemText align="right" primary="100" secondary="$6.96 USD" />
      </ListItem>
    </List>
  );
};
