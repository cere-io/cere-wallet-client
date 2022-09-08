import { Box, NoCoinsIcon, Typography } from '@cere-wallet/ui';

export const NoItems = () => {
  return (
    <Box>
      <NoCoinsIcon sx={{ fontSize: '120px' }} />
      <Typography align="center" fontWeight="bold">
        Coins not found
      </Typography>
      <Typography align="center" variant="body2" color="text.secondary">
        Add coins to your overview to see the balance and activity
      </Typography>
    </Box>
  );
};
