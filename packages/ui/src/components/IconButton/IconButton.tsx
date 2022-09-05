import { styled, IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps } from '@mui/material';

export type IconButtonProps = MuiIconButtonProps & {
  variant?: 'outlined' | 'icon';
};

export const IconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) => prop !== 'variant',
})<IconButtonProps>(({ theme, variant = 'icon' }) => ({
  borderWidth: variant === 'outlined' ? 1 : 0,
  backgroundColor: variant === 'outlined' ? theme.palette.background.paper : 'transparent',
  borderStyle: 'solid',
  borderColor: theme.palette.divider,
}));
