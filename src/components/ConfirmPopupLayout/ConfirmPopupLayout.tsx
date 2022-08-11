import { PropsWithChildren } from 'react';
import { styled, Box, Button, CereIcon, Container, Stack, Typography } from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';

export type ConfirmPopupLayoutProps = PropsWithChildren<{
  title?: string;
  network?: string;
  onConfirm: () => void;
  onCancel: () => void;
}>;

const Logo = styled(CereIcon)({
  fontSize: '40px',
});

export const ConfirmPopupLayout = ({
  title = 'Confirm transaction',
  network = '',
  children,
  onCancel,
  onConfirm,
}: ConfirmPopupLayoutProps) => {
  return (
    <Container maxWidth="sm">
      <Stack paddingY={5} spacing={5} alignItems="center">
        <Stack spacing={3} alignItems="center">
          <Logo />
          <Typography variant="h5" fontWeight="bold">
            {title}
          </Typography>
          <NetworkLabel label={network} />
        </Stack>

        <Box flex={1} alignSelf="stretch">
          {children}
        </Box>

        <Stack direction="row" alignSelf="stretch" spacing={2}>
          <Button size="large" fullWidth variant="contained" color="inherit" onClick={onCancel}>
            Cancel
          </Button>

          <Button size="large" fullWidth variant="contained" onClick={onConfirm}>
            Confirm
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};
