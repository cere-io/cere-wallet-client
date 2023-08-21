import { ReactNode } from 'react';
import { styled, Stack, Typography, useTheme } from '@mui/material';

export type InfoTableRowProps = {
  label: ReactNode;
  value?: ReactNode;
  caption?: ReactNode;
};

const Text = styled(Typography)<{ isGame: boolean }>(({ theme, isGame }) => ({
  fontSize: 'inherit',
  fontWeight: theme.typography.fontWeightBold,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  color: isGame ? theme.palette.primary.light : theme.palette.text.secondary,
}));

const Label = styled(Text)<{ isGame: boolean }>(({ theme, isGame }) => ({
  color: isGame ? theme.palette.primary.light : theme.palette.text.secondary,
}));

const Caption = styled(Text)<{ isGame?: boolean }>(({ theme }) => ({
  color: theme.palette.text.caption,
}));

export const InfoTableRow = ({ label, value, caption }: InfoTableRowProps) => {
  const { isGame } = useTheme();
  return (
    <Stack direction="row">
      <Label isGame={isGame}>{label}</Label>
      <Stack spacing={1} direction="row" marginLeft="auto">
        <Text isGame={isGame}>{value}</Text>
        {caption && <Caption isGame>{caption}</Caption>}
      </Stack>
    </Stack>
  );
};
