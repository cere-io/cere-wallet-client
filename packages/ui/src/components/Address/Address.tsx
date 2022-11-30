import { forwardRef, ReactNode, Ref } from 'react';
import { Stack, styled, Typography, svgIconClasses, Button } from '@mui/material';

import { Truncate, TruncateProps } from '../Truncate';

export type AddressProps = Pick<TruncateProps, 'maxLength'> & {
  address: string;
  onClick?: () => void;
  icon?: ReactNode;
  size?: 'small' | 'medium';
  variant?: 'default' | 'text' | 'outlined' | 'filled';
  endAdornment?: ReactNode;
};

const Wrapper = styled(Stack, {
  shouldForwardProp: (prop) => prop === 'direction' || prop === 'spacing' || prop === 'children',
})<Omit<AddressProps, 'address'>>(({ theme, icon, size, variant, endAdornment }) => ({
  borderRadius: 25,
  alignItems: 'center',
  borderStyle: 'solid',
  borderWidth: variant === 'outlined' ? 1 : 0,
  borderColor: theme.palette.divider,
  backgroundColor: variant === 'filled' ? theme.palette.grey[100] : theme.palette.background.paper,

  ...(size === 'small'
    ? {
        height: 32,
        paddingLeft: icon ? 4 : 12,
        paddingRight: endAdornment ? 4 : 12,
      }
    : {
        height: 40,
        paddingLeft: icon ? 6 : 16,
        paddingRight: endAdornment ? 6 : 16,
      }),
}));

const Icon = styled('div')<Pick<AddressProps, 'size'>>(({ theme, size }) => ({
  backgroundColor: theme.palette.grey[200],
  borderRadius: '50%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  ...(size === 'medium'
    ? {
        width: 28,
        height: 28,
      }
    : {
        width: 24,
        height: 24,
      }),

  [`& .${svgIconClasses.root}`]: {
    fontSize: theme.typography.pxToRem(size === 'medium' ? 20 : 18),
  },
}));

const Clickable = styled(Button)(({ theme }) => ({
  padding: 0,
  color: theme.palette.text.secondary,
}));

export const Address = forwardRef(
  (
    { variant = 'default', size = 'medium', icon, address, maxLength, endAdornment, onClick }: AddressProps,
    ref: Ref<any>,
  ) => {
    const addressElement = <Truncate text={address} variant="hex" maxLength={maxLength} />;
    const renderedElement =
      variant === 'text' ? (
        addressElement
      ) : (
        <Wrapper
          ref={ref}
          direction="row"
          spacing={size === 'medium' ? 1 : 0.5}
          variant={variant}
          size={size}
          icon={icon}
          endAdornment={endAdornment}
        >
          {icon && <Icon size={size}>{icon}</Icon>}
          <Typography noWrap variant="body1" color="text.primary">
            {addressElement}
          </Typography>

          {endAdornment}
        </Wrapper>
      );

    return onClick ? (
      <Clickable variant="text" onClick={onClick}>
        {renderedElement}
      </Clickable>
    ) : (
      renderedElement
    );
  },
);
