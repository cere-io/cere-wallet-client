import { ReactElement } from 'react';
import {
  styled,
  Badge,
  svgIconClasses,
  ListItemIcon as MuiListitemIcon,
  ListItemIconProps as MuiListItemIconProps,
} from '@mui/material';

export type ListItemIconProps = MuiListItemIconProps & {
  variant?: 'outlined' | 'default';
  badge?: ReactElement;
  inset?: boolean;
};

const BadgeContent = styled('div')(({ theme }) => ({
  width: 15,
  height: 15,
  padding: 4,
  marginLeft: -4,
  marginTop: -12,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,

  [`& .${svgIconClasses.root}`]: {
    fontSize: theme.typography.pxToRem(16),
  },
}));

const Outlined = styled('div')(({ theme }) => ({
  display: 'flex',
  borderRadius: '50%',
  borderWidth: 1,
  borderStyle: 'solid',
  padding: 10,
  borderColor: theme.palette.divider,

  [`& .${svgIconClasses.root}`]: {
    fontSize: theme.typography.pxToRem(16),
  },
}));

const StyledItemIcon = styled(MuiListitemIcon, {
  shouldForwardProp: (prop) => prop !== 'inset',
})<Pick<ListItemIconProps, 'inset'>>(({ theme, inset }) => ({
  fontSize: theme.typography.pxToRem(32),
  paddingLeft: inset ? 4 : 0,
}));

export const ListItemIcon = ({ variant = 'default', badge, children, ...props }: ListItemIconProps) => {
  let content = variant === 'default' ? children : <Outlined>{children}</Outlined>;

  if (badge) {
    content = (
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={<BadgeContent>{badge}</BadgeContent>}
      >
        {content}
      </Badge>
    );
  }

  return <StyledItemIcon {...props}>{content}</StyledItemIcon>;
};
