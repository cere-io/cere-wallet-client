import {
  Dialog,
  DialogContent,
  DialogProps,
  EastIcon,
  SouthEastIcon,
  Stack,
  Success,
  Typography,
  Divider,
  Button,
  styled,
} from '@cere-wallet/ui';

export type WalletIntroduceFinishProps = DialogProps & {
  onBackClick?: () => void;
  onDoneClick?: () => void;
};

const VioletBox = styled(Stack)(() => ({
  backgroundColor: '#F5F1FE',
  borderRadius: '12px',
}));

const LeftIcon = styled(SouthEastIcon)(({ theme }) => ({
  height: 32,
  width: 32,
  padding: 5,
  color: theme.palette.primary.main,
}));

const RightIcon = styled(EastIcon)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.neutral.contrastText,
  height: 32,
  width: 32,
  padding: 5,
  borderRadius: 100,
}));

export const WalletIntroduceFinishDialog = ({ onDoneClick, onBackClick, ...props }: WalletIntroduceFinishProps) => {
  return (
    <Dialog {...props} maxWidth="xs" origin="center" transitionDuration={0}>
      <DialogContent style={{ padding: 16 }}>
        <Stack spacing={1} alignItems="center">
          <Success style={{ width: 64, height: 64 }} />
          <Typography variant="h4">Done! What’s next?</Typography>
          <Typography variant="body2" color="text.secondary" paddingBottom={1}>
            Here’s what most people do first.
          </Typography>
          <VioletBox spacing={1} direction="row" alignItems="center" padding={1}>
            <LeftIcon />
            <Stack>
              <Typography variant="body2" color="primary.main" fontWeight="medium">
                Receive funds from external wallet
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Receive USDC via Polygon network on your wallet
              </Typography>
            </Stack>
            <RightIcon />
          </VioletBox>
          <Divider sx={{ width: '100%', paddingTop: 2 }} />
          <Stack spacing={1} direction="row" alignItems="center" justifyContent="space-between" minWidth={300}>
            <Typography variant="body2" color="text.secondary">
              4 of 4
            </Typography>
            <Stack direction="row" alignItems="center" justifyContent="center">
              <Button variant="text" size="large" onClick={() => onBackClick?.()}>
                Back
              </Button>

              <Button variant="contained" size="large" onClick={() => onDoneClick?.()}>
                Done
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
