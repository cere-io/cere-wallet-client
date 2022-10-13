import { observer } from 'mobx-react-lite';
import { Address, Button, MaticIcon, Paper, Stack, styled, TopUpIcon, TransferIcon, Typography } from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';
import { AccountBalance } from '../AccountBalance';
import { PageHeader } from '../PageHeader';
import { AddressQRButton } from '../AddressQRButton';
import { Link } from '../Link';

export type AccountBalanceWidgetProps = {
  title: string;
  dense?: boolean;
};

const Content = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(90deg, #EDF0FF 0%, #F5F1FE 100%)',
}));

export const AccountBalanceWidget = ({ title, dense = false }: AccountBalanceWidgetProps) => {
  const { account } = useAccountStore();
  const qrButtonSize = dense ? 32 : 40;
  const addressElement = account && (
    <Stack direction="row" spacing={1} alignItems="center">
      <Address
        showCopy
        address={account.address}
        variant={dense ? 'default' : 'outlined'}
        size={dense ? 'small' : 'medium'}
        maxLength={dense ? 10 : 24}
        icon={!dense && <MaticIcon />}
      />

      <AddressQRButton
        address={account.address}
        variant="outlined"
        sx={{
          width: qrButtonSize,
          height: qrButtonSize,
          borderWidth: dense ? 0 : 1,
        }}
      />
    </Stack>
  );

  return (
    <Stack>
      {!dense && <PageHeader title={title} rightElement={addressElement} />}

      <Content
        elevation={0}
        sx={{
          paddingX: dense ? 2 : 6,
          paddingY: dense ? 3 : 6,
        }}
      >
        <Stack
          spacing={2}
          justifyContent="space-between"
          direction={dense ? undefined : 'row'}
          alignItems={dense ? undefined : 'center'}
        >
          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant={dense ? 'body14Medium' : 'h4'} color="text.secondary">
                Total Balance
              </Typography>

              {dense && addressElement}
            </Stack>

            <AccountBalance variant={dense ? 'h2' : 'h1'} />
          </Stack>

          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            <Button
              sx={{
                visibility: 'hidden', // This button is needed just to book the space. Implementation will be added later
              }}
              fullWidth={dense}
              size={dense ? 'medium' : 'large'}
              variant="contained"
              startIcon={<TransferIcon />}
            >
              Transfer
            </Button>

            <Button
              to="topup"
              component={Link}
              fullWidth={dense}
              size={dense ? 'medium' : 'large'}
              variant="contained"
              startIcon={<TopUpIcon />}
            >
              Top Up
            </Button>
          </Stack>
        </Stack>
      </Content>
    </Stack>
  );
};

export default observer(AccountBalanceWidget);
