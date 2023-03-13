import { PropsWithChildren } from 'react';
import { styled, Box, CircularProgress, CircularProgressProps } from '@mui/material';

export type LoadingProps = PropsWithChildren<CircularProgressProps> & {
  fullScreen?: boolean;
};

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

const Fullscreen = styled('div')({
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

export const Loading = ({ sx, fullScreen = false, size = 60, children, ...props }: LoadingProps) => {
  const spinner = (
    <Box sx={sx} position="relative" display="inline-block" width={size} height={size}>
      {children && <Content>{children}</Content>}
      <CircularProgress {...props} size={size} />
    </Box>
  );

  return fullScreen ? <Fullscreen sx={sx}>{spinner}</Fullscreen> : spinner;
};
