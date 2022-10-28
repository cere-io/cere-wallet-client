import { Button, Dialog, DialogContent, DialogProps, Stack, Typography } from '@cere-wallet/ui';

import tourHeaderImage from '~/assets/tour-header.png';

export type WalletIntroduceStartProps = DialogProps & {
  onStartTour: () => void;
};

export const WalletIntroduceStartDialog = ({ onStartTour, ...props }: WalletIntroduceStartProps) => {
  return (
    <Dialog {...props} maxWidth="xs" fullScreen={false} transitionDuration={0}>
      <DialogContent style={{ padding: 0 }}>
        <img src={tourHeaderImage} width="100%" alt="Product Tour" />
        <Stack spacing={1} alignItems="stretch" style={{ backgroundColor: 'white' }} padding={3}>
          <Stack spacing={2} alignItems="center">
            <Typography variant="h3">Cere wallet introducing!</Typography>
            <Typography variant="body1" color="text.secondary">
              Your collectible will be available in your collectibles overview in a few mins
            </Typography>
          </Stack>
          <Stack spacing={1} alignItems="stretch">
            <Button variant="contained" size="large" onClick={() => onStartTour()}>
              Take the tour
            </Button>
            <Button onClick={(event) => props?.onClose?.(event, 'closeClick')} variant="text" size="large">
              Skip for now
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
