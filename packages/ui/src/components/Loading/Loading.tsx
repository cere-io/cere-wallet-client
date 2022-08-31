import { PropsWithChildren } from 'react';
import { styled, Box, CircularProgress, CircularProgressProps } from '@mui/material';

export type LoadingProps = PropsWithChildren<CircularProgressProps>;

const Content = styled('div')({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  top: 6,
  bottom: 6,
  left: 6,
  right: 6,
});

export const Loading = ({ sx, size = 60, children, ...props }: LoadingProps) => (
  <Box sx={sx} position="relative" display="inline-block" width={size} height={size}>
    <Content>{children}</Content>
    <CircularProgress {...props} size={size} />
  </Box>
);
