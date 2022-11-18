import { ListItemTextProps as MuiListItemTextProps, ListItemText as MuiListitemText, styled } from '@mui/material';

export type ListItemTextProps = MuiListItemTextProps & {
  align?: 'left' | 'right';
};

export const ListItemText = styled(MuiListitemText, {
  shouldForwardProp: (prop) => prop !== 'align',
})<ListItemTextProps>(({ theme, align = 'left' }) =>
  align === 'left'
    ? {}
    : {
        flexGrow: 0,
        flexShrink: 0,
        textAlign: 'right',
        marginLeft: 'auto',
        paddingLeft: theme.spacing(1),
      },
);
