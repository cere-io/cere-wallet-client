import { ContentCopy } from '@mui/icons-material';
import { IconButton, Stack, styled, Typography, svgIconClasses } from '@mui/material';
import { ReactNode } from 'react';
import { Truncate, TruncateProps } from '../Truncate';

export type AddressProps = Pick<TruncateProps, 'maxLength'> & {
  address: string;
  icon?: ReactNode;
  size?: 'small' | 'medium';
  variant?: 'default' | 'text' | 'outlined' | 'filled';

  onCopy?: () => void;
  showCopy?: boolean;
};

const Wrapper = styled(Stack, {
  shouldForwardProp: (prop) => prop === 'direction' || prop === 'spacing' || prop === 'children',
})<Omit<AddressProps, 'address'>>(({ theme, icon, size, variant, showCopy }) => ({
  borderRadius: 25,
  alignItems: 'center',
  borderStyle: 'solid',
  borderWidth: variant === 'outlined' ? 1 : 0,
  borderColor: theme.palette.divider,
  backgroundColor: variant === 'filled' ? theme.palette.grey[100] : theme.palette.background.paper,

  ...(size === 'small'
    ? {
        height: 32,
        paddingLeft: icon ? 2 : 12,
        paddingRight: showCopy ? 2 : 12,
      }
    : {
        height: 40,
        paddingLeft: icon ? 6 : 16,
        paddingRight: showCopy ? 6 : 16,
      }),
}));

const Icon = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.grey[200],
  borderRadius: '50%',
  width: 28,
  height: 28,
  padding: 4,

  [`& .${svgIconClasses.root}`]: {
    fontSize: theme.typography.pxToRem(20),
  },
}));

export const Address = ({
  variant = 'default',
  size = 'medium',
  icon,
  address,
  maxLength,
  onCopy,
  showCopy = !!onCopy,
}: AddressProps) => {
  const addressElement = <Truncate text={address} variant="hex" maxLength={maxLength} />;

  return variant === 'text' ? (
    addressElement
  ) : (
    <Wrapper
      direction="row"
      spacing={size === 'medium' ? 1 : 0.5}
      variant={variant}
      size={size}
      showCopy={showCopy}
      icon={icon}
    >
      {icon && <Icon>{icon}</Icon>}
      <Typography variant="body2">{addressElement}</Typography>
      {showCopy && (
        <IconButton size="small" onClick={onCopy}>
          <ContentCopy fontSize="small" />
        </IconButton>
      )}
    </Wrapper>
  );
};
