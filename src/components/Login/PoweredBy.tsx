import { CereIcon, Stack, Typography } from '@cere-wallet/ui';

export const PoweredBy = () => (
  <Stack direction="row" alignItems="center" justifyContent="center" marginTop={4}>
    <Typography sx={{ marginRight: '8px' }} variant="body2" color="text.secondary">
      Powered by Cere Wallet
    </Typography>
    <CereIcon />
  </Stack>
);
