import {
  styled,
  List as MuiList,
  ListProps as MuiListProps,
  listItemClasses,
  listItemIconClasses,
} from '@mui/material';

export type ListProps = MuiListProps & {
  variant?: 'outlined' | 'default';
};

export const List = styled(MuiList)<ListProps>(({ theme, dense, variant }) => ({
  ...(variant === 'outlined' && {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: theme.palette.divider,
    borderRadius: 16,
    paddingRight: theme.spacing(dense ? 0 : 3),
    paddingLeft: theme.spacing(dense ? 0 : 3),

    [`& .${listItemClasses.gutters}`]: dense
      ? undefined
      : {
          paddingLeft: 0,
          paddingRight: 0,
        },
  }),

  [`& .${listItemIconClasses.root}`]: !dense
    ? undefined
    : {
        minWidth: 50,
      },
}));
