import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps, styled } from '@mui/material';

export type IconButtonProps = MuiIconButtonProps & {
  variant?: 'outlined' | 'filled' | 'icon';
};

export const IconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<IconButtonProps>(({ theme, variant = 'icon', size }) => ({
  ...(variant === 'outlined' && {
    backgroundColor: theme.palette.background.paper,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
  }),

  ...(variant === 'filled' && {
    backgroundColor: theme.palette.grey[100],
  }),
}));
