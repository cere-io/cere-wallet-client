import { Alert, Stack, Box } from '@cere-wallet/ui';
import { PageHeader } from '~/components';

export const TopUp = () => {
  return (
    <>
      <PageHeader title="Top Up" backUrl=".." />

      <Stack direction="row" spacing={8}>
        <Stack spacing={3} flex={3}>
          <Alert severity="info" color="neutral" onClose={() => {}}>
            Fund your wallet with USDC. Send USDC from an exchange or other wallet via Polygon network to this wallet
            address.
          </Alert>
        </Stack>
        <Box bgcolor="neutral.light" flex={2} borderRadius={4} padding={2}>
          How to fund my wallet by sending USDC?
        </Box>
      </Stack>
    </>
  );
};
