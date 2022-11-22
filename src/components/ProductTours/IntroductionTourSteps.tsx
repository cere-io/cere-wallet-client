import { Stack, Typography } from '@cere-wallet/ui';
import { StepType } from '@reactour/tour';

export const introductionTourSteps: StepType[] = [
  {
    selector: '.wallet-address',
    content: (
      <Stack spacing={1}>
        <Typography variant="subtitle1">Wallet address</Typography>
        <Typography variant="body2" color="text.secondary">
          Here you can copy or scan the QR of your wallet address to send funds
        </Typography>
      </Stack>
    ),
  },
  {
    selector: '.wallet-top-up',
    content: (
      <Stack spacing={1}>
        <Typography variant="subtitle1">Top up & Receive</Typography>
        <Typography variant="body2" color="text.secondary">
          This button for quick action to easily top up funds with credit card or receive funds from external wallet
        </Typography>
      </Stack>
    ),
  },
  {
    selector: '.wallet-assets',
    content: (
      <Stack spacing={1}>
        <Typography variant="subtitle1">Assets, Collectibles & Activity</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your assets and collectibles, and view your wallet activity
        </Typography>
      </Stack>
    ),
  },
];
