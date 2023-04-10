import { FC, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { CloseIcon, IconButton, Box, Link, Stack, styled, Typography, TourIcon, Snackbar } from '@cere-wallet/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { getGlobalStorage } from '@cere-wallet/storage';

const SnackbarTourIcon = styled(TourIcon)(() => ({
  width: 40,
  height: 40,
}));

const SnackbarContainer = styled(Snackbar)(({ theme }) => ({
  background: theme.palette.background.paper,
  padding: 16,
  boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.1)',
  borderRadius: 16,
  maxWidth: 720,
  minHeight: 82,
  [theme.breakpoints.down('sm')]: {
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 0,
  },
}));

interface OnboardingSnackbarProps {
  onClose: () => void;
  open: boolean;
}

export const OnboardingSnackbar: FC<OnboardingSnackbarProps> = ({ onClose, open }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLinkClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      getGlobalStorage().setItem('showProductTourSnackbar', 'false');
      navigate({ ...location, hash: 'product-tour' });
    },
    [navigate, location],
  );

  return (
    <SnackbarContainer open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Box>
        <Stack direction="row" gap={2}>
          <Box>
            <SnackbarTourIcon />
          </Box>
          <Box>
            <Typography variant="body1" fontWeight="bold">
              Not sure how to use your wallet?
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight="regular">
              Get a better understanding through{' '}
              <Link href="" onClick={handleLinkClick}>
                a short product tour
              </Link>{' '}
              of how your wallet works
            </Typography>
          </Box>
          <Box>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Stack>
      </Box>
    </SnackbarContainer>
  );
};

export default observer(OnboardingSnackbar);
