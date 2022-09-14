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
} from '@cere-wallet/ui';

import Widget, { WidgetProps } from './Widget';

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

const WalletWidget = ({ store }: WidgetProps) => {
  return (
    <Widget store={store}>
      <Card>
        <Header
          title="merel.kloots@cere.io"
          subheader="0x1758df97...f13dcff426"
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
            <Typography fontWeight="bold">100 CERE</Typography>
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
            <Typography variant="caption">Mumbai Matic</Typography>
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
