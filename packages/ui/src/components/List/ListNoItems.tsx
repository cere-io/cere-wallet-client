import { ReactElement } from 'react';
import { styled, Stack, Typography } from '@mui/material';

export type ListNoItemsProps = {
  icon: ReactElement;
  title?: string;
  description?: string;
};

const Icon = styled('div')(({ theme }) => ({
  display: 'flex',
  textAlign: 'center',
  fontSize: theme.typography.pxToRem(120),
}));

export const ListNoItems = ({ icon, title, description }: ListNoItemsProps) => (
  <Stack alignItems="center" padding={5} paddingTop={3}>
    <Icon>{icon}</Icon>
    <Typography align="center" fontWeight="bold">
      {title}
    </Typography>
    <Typography align="center" variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Stack>
);
