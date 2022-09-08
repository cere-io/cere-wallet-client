import { Box, NoActivityIcon, Typography } from '@cere-wallet/ui';

export const NoItems = () => {
  return (
    <Box>
      <NoActivityIcon sx={{ fontSize: '120px' }} />
      <Typography align="center" fontWeight="bold">
        You have no transactions yet
      </Typography>
      <Typography align="center" variant="body2" color="text.secondary">
        Use your wallet in transactions and they will automatically show here
      </Typography>
    </Box>
  );
};
