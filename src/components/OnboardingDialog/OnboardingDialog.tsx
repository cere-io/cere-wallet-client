import {
  Dialog,
  DialogContent,
  DialogProps,
  EastIcon,
  SouthEastIcon,
  Stack,
  Typography,
  Button as UIButton,
  styled,
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
            <Typography align="center" variant="h3">
              Welcome to Cere Wallet!
            </Typography>

            <Typography align="center" variant="body1" color="text.secondary">
              Here’s what most people do to fund their wallet in order to purchase
            </Typography>
          </Stack>

          <Button fullWidth={isMobile} component={Link} size={isMobile ? 'medium' : 'large'} to="topup">
            <Stack direction="row" spacing={isMobile ? 2 : 3} alignItems="center">
              <SouthEastIcon />
              <Stack>
                <Typography variant="body1" fontWeight={isMobile ? 'medium' : 'regular'}>
                  Receive funds from external wallet
                </Typography>

                <Typography variant="body1" color="text.secondary">
                  Receive USDC via Polygon on your wallet
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
              marginTop: isMobile ? 'auto' : 1,
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
