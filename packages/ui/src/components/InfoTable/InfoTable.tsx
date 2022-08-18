import { Box, BoxProps, Divider, Stack } from '@mui/material';
import { PropsWithChildren } from 'react';

import { InfoTableRow } from './InfoTableRow';

export type InfoTableProps = PropsWithChildren<BoxProps>;

export const InfoTable = ({ children, ...props }: InfoTableProps) => (
  <Box {...props}>
    <Stack spacing={2} marginBottom={2} divider={<Divider />}>
      {children}
    </Stack>
    <Divider />
  </Box>
);

InfoTable.Row = InfoTableRow;
