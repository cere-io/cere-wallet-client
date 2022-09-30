import { Avatar, ListItem, ListItemAvatar, ListItemText, TypographyProps } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useAppContextStore } from '~/hooks';

export type AppContextBannerProps = {};

type Row = {
  variant: 'primary' | 'secondary';
  color: string;
};

const typographyPropsMap: Record<Row['variant'], TypographyProps<any>> = {
  primary: {
    variant: 'body1',
    fontWeight: 'bold',
    color: 'text.primary',
  },

  secondary: {
    variant: 'body2',
    fontWeight: 'normal',
    color: 'text.secondary',
  },
};

const getTypographyProps = ({ variant, color }: Row) => ({
  ...typographyPropsMap[variant],
  color: color || typographyPropsMap[variant].color,
});

const AppContextBanner = (props: AppContextBannerProps) => {
  const { context } = useAppContextStore();
  const { banner } = context || {};

  if (!banner) {
    return null;
  }

  return (
    <ListItem>
      <ListItemAvatar>
        <Avatar variant="rounded" src={banner.thumbnailUrl} />
      </ListItemAvatar>

      <ListItemText
        primary={banner.contentRows[0].text}
        secondary={banner.contentRows[1].text}
        primaryTypographyProps={getTypographyProps(banner.contentRows[0])}
        secondaryTypographyProps={getTypographyProps(banner.contentRows[1])}
      />

      <ListItemText
        align="right"
        primary={banner.rightRows[0].text}
        secondary={banner.rightRows[1].text}
        primaryTypographyProps={getTypographyProps(banner.rightRows[0])}
        secondaryTypographyProps={getTypographyProps(banner.rightRows[1])}
      />
    </ListItem>
  );
};

export default observer(AppContextBanner);
