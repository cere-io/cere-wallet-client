import { ReactNode } from 'react';
import { styled, Stack, Typography } from '@mui/material';

export type InfoTableRowProps = {
  label: ReactNode;
  value: ReactNode;
  caption?: ReactNode;
};

const Text = styled(Typography)(({ theme }) => ({
  fontWeight: theme.typography.fontWeightBold,
}));

const Label = styled(Text)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const Caption = styled(Text)(({ theme }) => ({
  color: theme.palette.text.caption,
}));

export const InfoTableRow = ({ label, value, caption }: InfoTableRowProps) => (
  <Stack direction="row">
    <Label>{label}</Label>
    <Stack spacing={1} direction="row" marginLeft="auto">
      <Text>{value}</Text>
      {caption && <Caption>{caption}</Caption>}
    </Stack>
  </Stack>
);
