import { observer } from 'mobx-react-lite';
import {
  List,
  ListNoItems,
  NoActivityIcon,
  TransactionInIcon,
  TransactionOutIcon,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@cere-wallet/ui';

import { useActivityStore } from '~/hooks';
import { CoinIcon } from '../CoinIcon';

export type ActivityListProps = {
  dense?: boolean;
};

const ActivityList = ({ dense }: ActivityListProps) => {
  const { list } = useActivityStore();

  return (
    <List variant="outlined" dense={dense}>
      {!list.length && (
        <ListNoItems
          icon={<NoActivityIcon fontSize="inherit" />}
          title="You have no transactions yet"
          description="Use your wallet in transactions and they will automatically show here"
        />
      )}

      {list.map((activity, index) => {
        const { flow, type, asset, hash, date } = activity;
        const color = type === 'in' ? 'success.main' : 'error.main';
        const title = type === 'in' ? 'Receive' : 'Send';
        const caption = type === 'in' ? `From: ${activity.from}` : `To: ${activity.to}`;
        const flowSign = type === 'in' ? '' : '-';

        const isLast = index === list.length - 1;
        const flowTitle = `${flowSign}${flow.amount} ${flow.symbol}`;
        const flowCaption = flow.equalsTo && `${flowSign}${flow.equalsTo.amount} ${flow.equalsTo.symbol}`;

        return (
          <ListItem key={hash} divider={!isLast}>
            <ListItemIcon variant="outlined" badge={<CoinIcon coin={asset} />}>
              {type === 'in' ? <TransactionInIcon /> : <TransactionOutIcon />}
            </ListItemIcon>

            <ListItemText primary={title} secondary={`${date} | ${caption}`} />
            <ListItemText
              primaryTypographyProps={{ color }}
              align="right"
              primary={flowTitle}
              secondary={flowCaption}
            />
          </ListItem>
        );
      })}
    </List>
  );
};

export default observer(ActivityList);
