import { Box, BoxProps, Divider, Stack, Typography } from '@mui/material';
import { PropsWithChildren } from 'react';

import { InfoTableRow } from './InfoTableRow';

export type InfoTableProps = PropsWithChildren<
  BoxProps & {
    dense?: boolean;
  }
>;

export const InfoTable = ({ children, dense = false, ...props }: InfoTableProps) => (
  <Box {...props}>
    <Typography component="div" variant="body1" fontWeight={dense ? 'fontWeightMedium' : 'fontWeightRegular'}>
      <Stack spacing={dense ? 1 : 2} marginBottom={dense ? 1 : 2} divider={!dense && <Divider />}>
        {children}
      </Stack>
    </Typography>

    {!dense && <Divider />}
  </Box>
);

InfoTable.Row = InfoTableRow;
