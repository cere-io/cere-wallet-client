import { observer } from 'mobx-react-lite';
import { Button, CopyButton, Paper, Stack, styled, TopUpIcon, TransferIcon, Typography } from '@cere-wallet/ui';

import { useAccountStore } from '~/hooks';
import { AccountBalance } from '../AccountBalance';
import { PageHeader } from '../PageHeader';
import { AddressQRButton } from '../AddressQRButton';
import { Link } from '../Link';
import { AddressDropdown } from '../AddressDropdown';
import { FEATURE_FLAGS } from '~/constants';

export type AccountBalanceWidgetProps = {
  title: string;
  dense?: boolean;
};

const Content = styled(Paper)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(90deg, #EDF0FF 0%, #F5F1FE 100%)',
}));

export const AccountBalanceWidget = ({ title, dense = false }: AccountBalanceWidgetProps) => {
  const { selectedAccount: account } = useAccountStore();
  const qrButtonSize = dense ? 32 : 40;

  const buttonSx = {
    width: qrButtonSize,
    height: qrButtonSize,
    borderWidth: dense ? 0 : 1,
  };

  const addressElement = account && (
    <Stack
      direction="row"
      spacing={1}
      className="wallet-address" // css class "wallet-address" is an anchor for product tour
      alignItems="center"
    >
      <AddressDropdown
        variant={dense ? 'default' : 'outlined'}
        size={dense ? 'small' : 'medium'}
        maxLength={dense ? 10 : 24}
      />

      <CopyButton sx={buttonSx} value={account.address} variant="outlined" successMessage="Address copied" />
      <AddressQRButton sx={buttonSx} address={account.address} variant="outlined" />
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
              <Typography
                variant={dense ? 'body2' : 'h4'}
                fontWeight={dense ? 'medium' : undefined}
                color="text.secondary"
              >
                Total balance
              </Typography>

              {dense && addressElement}
            </Stack>

            <AccountBalance variant={dense ? 'h2' : 'h1'} />
          </Stack>

          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2}>
            {FEATURE_FLAGS.transferAssets && (
              <Button
                fullWidth={dense}
                to="transfer"
                component={Link}
                size={dense ? 'medium' : 'large'}
                variant="contained"
                startIcon={<TransferIcon />}
              >
                Transfer
              </Button>
            )}

            {/* css class "wallet-top-up" is an anchor for product tour */}
            <Button
              className="wallet-top-up"
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
