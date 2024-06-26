import { observer } from 'mobx-react-lite';
import {
  Box,
  Card as UICard,
  CardHeader,
  CardContent,
  Avatar,
  styled,
  Typography,
  WifiIcon,
  Button,
  CardActions,
  Stack,
  Truncate,
  Address,
  CopyButton,
  useIsMobile,
  TopUpIcon,
  IconButton,
  Logo,
  Loading,
} from '@cere-wallet/ui';

import { useAccountStore, useAuthenticationStore, useNetworkStore } from '~/hooks';
import { AccountBalance } from '../AccountBalance';
import { useShowWallet } from './useShowWallet';
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
  position: 'relative',
}));

const LoadingContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(2, 0, 1, 0),
  minWidth: 324,
  minHeight: 215,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const Actions = styled(CardActions)({
  padding: 0,
  justifyContent: 'flex-end',
});

const Action = styled(Button)(({ theme }) => ({
  paddingLeft: theme.spacing(1.5),
  paddingRight: theme.spacing(1.5),
}));

const TopUpButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  left: 'auto',
  top: 20,
  right: 0,
  padding: 10,
  color: 'white',
  backgroundColor: theme.palette.primary.main,
  '&:hover, &:focus, &:active': {
    color: 'white',
    backgroundColor: theme.palette.primary.main,
  },
}));

const OpenTopIcon = styled(TopUpIcon)(() => ({
  height: 16,
  width: 16,
}));

const WalletWidget = () => {
  const isMobile = useIsMobile();
  const authStore = useAuthenticationStore();
  const { selectedAccount, user } = useAccountStore();
  const { network } = useNetworkStore();
  const showWallet = useShowWallet();

  const maxLength = isMobile ? 14 : 20;

  if (authStore.isRehydrating) {
    return (
      <Widget>
        <Card>
          <LoadingContent>
            <Loading>
              <Logo />
            </Loading>
          </LoadingContent>
        </Card>
      </Widget>
    );
  }

  if (!selectedAccount || !user || !network) {
    return null;
  }

  return (
    <Widget>
      <Card>
        <Header
          title={<Truncate variant="email" text={user.email} maxLength={maxLength} />}
          subheader={<Address variant="text" address={selectedAccount.address} maxLength={maxLength} />}
          avatar={<Avatar src={user.avatar} />}
          action={<CopyButton value={selectedAccount.address} successMessage="Address copied" />}
        />
        <Content>
          <Box marginBottom={1}>
            <Typography variant="caption" color="text.caption">
              TOTAL VALUE
            </Typography>
            <AccountBalance fontWeight="bold" />
          </Box>

          <Typography variant="caption" color="text.secondary">
            <Stack direction="row" alignItems="baseline" spacing={0.5}>
              <WifiIcon fontSize="inherit" />
              <Typography variant="caption">{network.displayName}</Typography>
            </Stack>
          </Typography>
          <TopUpButton onClick={() => showWallet('topup')}>
            <OpenTopIcon />
          </TopUpButton>
        </Content>
        <Actions>
          <Action variant="text" onClick={() => authStore.logout()}>
            Sign out
          </Action>

          <Action variant="text" onClick={() => showWallet()}>
            Open Wallet
          </Action>
        </Actions>
      </Card>
    </Widget>
  );
};

export default observer(WalletWidget);
