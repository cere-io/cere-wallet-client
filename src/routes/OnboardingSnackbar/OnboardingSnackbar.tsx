import { FC, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { CloseIcon, Box, Button, IconButton, Stack, styled, Typography, TourIcon, Snackbar } from '@cere-wallet/ui';
import { useLocation, useNavigate } from 'react-router-dom';

const CloseButton = styled(IconButton)(({ theme }) => ({
  '&:hover': {
    '& svg': {
      fill: theme.palette.primary.main,
    },
  },
}));

const LinkButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  padding: 0,
  fontSize: 14,
  fontWeight: 'normal',
  '&:hover': {
    backgroundColor: 'white',
  },
}));

const SnackbarTourIcon = styled(TourIcon)(() => ({
  width: 40,
  height: 40,
}));

const SnackarContainer = styled(Snackbar)(({ theme }) => ({
  background: 'white',
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

  const handleLinkClick = useCallback(() => {
    localStorage.setItem('showProductTourSnackbar', 'false');
    navigate({ ...location, hash: 'product-tour' });
  }, [navigate, location]);

  return (
    <SnackarContainer open={open} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Stack gap={2}>
        <Box>
          <SnackbarTourIcon />
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Not sure how to use your wallet?
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight="regular">
            Get a better understanding through{' '}
            <LinkButton variant="text" onClick={handleLinkClick}>
              a short product tour
            </LinkButton>{' '}
            of how your wallet works
          </Typography>
        </Box>
        <Box>
          <CloseButton size="small" onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </Box>
      </Stack>
    </SnackarContainer>
  );
};

export default observer(OnboardingSnackbar);
