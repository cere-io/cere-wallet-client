import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { CloseIcon, Banner, Box, Link, IconButton, Stack, styled, Typography, TourIcon } from '@cere-wallet/ui';

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.typography.pxToRem(12),
  top: theme.typography.pxToRem(12),
  '&:hover': {
    '& svg': {
      fill: theme.palette.primary.main,
    },
  },
}));

interface OnboardingBannerProps {
  onClose: () => void;
}

export const OnboardingBanner: FC<OnboardingBannerProps> = ({ onClose }) => {
  return (
    <Banner placement="bottom">
      <Stack gap={2}>
        <Box>
          <TourIcon />
        </Box>
        <Box>
          <Typography variant="body1" fontWeight="bold">
            Not sure how to use your wallet?
          </Typography>
          <Typography variant="body1" fontWeight="regular">
            Get a better understanding through <Link>a short product tour</Link> of how your wallet works
          </Typography>
        </Box>
        <Box>
          <CloseButton size="small" onClick={onClose}>
            <CloseIcon />
          </CloseButton>
        </Box>
      </Stack>
    </Banner>
  );
};

export default observer(OnboardingBanner);
