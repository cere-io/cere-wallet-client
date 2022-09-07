import { Stack, Chip, styled, Typography } from '@mui/material';

import { ComingSoonIcon } from '../../icons';

export type ComingSoonProps = {
  title?: string;
  description?: string;
};

const Image = styled(ComingSoonIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(240),
}));

export const ComingSoon = ({ title, description }: ComingSoonProps) => (
  <Stack spacing={1} alignItems="center">
    <Image />
    <Chip color="secondary" label="Coming Soon" />

    {title && (
      <Typography variant="h6" align="center">
        {title}
      </Typography>
    )}

    {description && (
      <Typography color="text.secondary" align="center">
        {description}
      </Typography>
    )}
  </Stack>
);
