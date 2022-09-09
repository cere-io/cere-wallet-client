import {
  List,
  ListNoItems,
  NoActivityIcon,
  // TransactionInIcon,
  // TransactionOutIcon,
  // ListItem,
  // ListItemIcon,
  // ListItemText,
  // CereIcon,
} from '@cere-wallet/ui';

export type ActivityListProps = {
  dense?: boolean;
};

export const ActivityList = ({ dense }: ActivityListProps) => {
  return (
    <List variant="outlined" dense={dense}>
      {/* <ListItem divider>
        <ListItemIcon variant="outlined" badge={<CereIcon />}>
          <TransactionOutIcon />
        </ListItemIcon>

        <ListItemText primary="Send" secondary="Aug 5 | To: 0x97cb71F9884AC9B98AEb78AE1fe1f4A639202fFB" />
        <ListItemText
          primaryTypographyProps={{ color: 'error.main' }}
          align="right"
          primary="-1 CERE"
          secondary="-$0.067 USD"
        />
      </ListItem>

      <ListItem divider>
        <ListItemIcon variant="outlined">
          <TransactionInIcon />
        </ListItemIcon>

        <ListItemText primary="Receive" secondary="Aug 5 | From: 0x97cb71F9884AC9B98AEb78AE1fe1f4A639202fFB" />
        <ListItemText
          primaryTypographyProps={{ color: 'success.main' }}
          align="right"
          primary="+103 CERE"
          secondary="+$7.12 USD"
        />
      </ListItem> */}

      <ListNoItems
        icon={<NoActivityIcon fontSize="inherit" />}
        title="You have no transactions yet"
        description="Use your wallet in transactions and they will automatically show here"
      />
    </List>
  );
};
