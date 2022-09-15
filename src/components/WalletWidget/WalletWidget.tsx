import { observer } from 'mobx-react-lite';
import {
  Box,
  Card as UICard,
  CardHeader,
  CardContent,
  Avatar,
  styled,
  Typography,
  ContentCopyIcon,
  WifiIcon,
  Button,
  CardActions,
  IconButton,
  Stack,
  Truncate,
  Address,
} from '@cere-wallet/ui';

import { useEmbeddedWalletStore } from '~/hooks';
import { AccountBalance } from '../AccountBalance';
import Widget from './Widget';

const Card = styled(UICard)({
  border: 'none',
});

const Header = styled(CardHeader)({
  border: 'none',
  borderRadius: 12,
});

const Content = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2, 0, 1, 0),
}));

const Actions = styled(CardActions)({
  padding: 0,
  justifyContent: 'flex-end',
});

const WalletWidget = () => {
  const { account, network } = useEmbeddedWalletStore();

  if (!account || !network) {
    return null;
  }

  return (
    <Widget>
      <Card>
        <Header
          title={<Truncate variant="email" text={account.email} maxLength={16} />}
          subheader={<Address variant="text" address={account.address} maxLength={16} />}
          avatar={<Avatar />}
          action={
            <IconButton>
              <ContentCopyIcon />
            </IconButton>
          }
        />
        <Content>
          <Box marginBottom={1}>
            <Typography variant="caption" color="text.caption">
              TOTAL VALUE
            </Typography>
            <AccountBalance fontWeight="bold" />
          </Box>

          <Typography
            component={Stack}
            variant="caption"
            color="text.secondary"
            fontWeight="bold"
            direction="row"
            alignItems="baseline"
            spacing={0.5}
          >
            <WifiIcon fontSize="inherit" />
            <Typography variant="caption">{network.displayName}</Typography>
          </Typography>
        </Content>
        <Actions>
          <Button variant="text">Open Wallet</Button>
        </Actions>
      </Card>
    </Widget>
  );
};

export default observer(WalletWidget);
