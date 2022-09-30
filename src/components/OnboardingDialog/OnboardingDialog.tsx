import {
  Button as UIButton,
  Dialog,
  DialogContent,
  DialogProps,
  EastIcon,
  SouthEastIcon,
  Stack,
  styled,
  Typography,
  useIsMobile,
} from '@cere-wallet/ui';

import { Link } from '../Link';

export type OnboardingDialogProps = DialogProps;

const Button = styled(UIButton)(({ theme, size }) => ({
  backgroundColor: '#F5F1FE',
  borderRadius: 16,
  padding: theme.spacing(size === 'large' ? 3 : 2),

  '&:hover': {
    backgroundColor: '#F5F1FE',
  },
})) as typeof UIButton;

export const OnboardingDialog = ({ open, onClose, ...props }: OnboardingDialogProps) => {
  const isMobile = useIsMobile();

  return (
    <Dialog {...props} fullScreen open={open} onClose={onClose} transitionDuration={open ? 0 : undefined}>
      <DialogContent>
        <Stack height="100%" alignItems="center">
          <Stack spacing={1} marginBottom={4}>
            <Typography align="center" variant="h6">
              Welcome to Cere Wallet!
            </Typography>

            <Typography align="center" variant="body2" color="text.secondary">
              Here’s what most people do to fund their wallet in order to purchase
            </Typography>
          </Stack>

          <Button fullWidth={isMobile} component={Link} size={isMobile ? 'medium' : 'large'} to="topup">
            <Stack direction="row" spacing={isMobile ? 2 : 3} alignItems="center">
              <SouthEastIcon />
              <Stack>
                <Typography variant={isMobile ? 'body2' : 'body1'} fontWeight="bold">
                  Send funds from external wallet
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Send USDC via Polygon to your wallet
                </Typography>
              </Stack>
              <EastIcon />
            </Stack>
          </Button>

          <UIButton
            variant="text"
            color="inherit"
            onClick={(event) => onClose?.(event, 'closeClick')}
            sx={{
              alignSelf: 'center',
              marginTop: 'auto',
              marginBottom: 1,
            }}
          >
            Explore the wallet
          </UIButton>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};