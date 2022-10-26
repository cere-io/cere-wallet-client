import {
  styled,
  Banner,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TypographyProps,
  Badge,
  BackIcon,
  IconButton,
} from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { useAppContextStore } from '~/hooks';

export type AppContextBannerProps = {};

type Row = {
  variant: 'primary' | 'secondary';
  color?: string;
};

const typographyPropsMap: Record<Row['variant'], TypographyProps<any>> = {
  primary: {
    variant: 'body2',
    fontWeight: 'medium',
    color: 'text.primary',
  },

  secondary: {
    variant: 'caption',
    fontWeight: 'regular',
    color: 'text.secondary',
  },
};

const BadgeImage = styled(Avatar)(({ theme }) => ({
  width: 23,
  height: 23,
  padding: 3,
  backgroundColor: theme.palette.background.paper,
}));

const getTypographyProps = ({ variant, color }: Row) => ({
  ...typographyPropsMap[variant],
  color: color || typographyPropsMap[variant].color,
});

const AppContextBanner = (props: AppContextBannerProps) => {
  const { banner } = useAppContextStore();

  const handleBackClick = useCallback(() => {
    window.close();
  }, []);

  if (!banner) {
    return null;
  }

  const hasBackButton = banner.hasBackButton ?? true;
  const [contentTitle, contentText] = banner.content;
  const [rightTitle, rightText] = banner.right || [];

  return (
    <Banner paddingLeft={hasBackButton ? 1.5 : 2} paddingRight={2} paddingY={0.5}>
      <ListItem disablePadding>
        {hasBackButton && (
          <IconButton sx={{ marginRight: 1 }} onClick={handleBackClick}>
            <BackIcon />
          </IconButton>
        )}

        {banner.thumbnailUrl && (
          <ListItemAvatar>
            <Badge
              invisible={!banner.badgeUrl}
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={<BadgeImage src={banner.badgeUrl} />}
            >
              <Avatar variant="rounded" src={banner.thumbnailUrl} />
            </Badge>
          </ListItemAvatar>
        )}

        <ListItemText
          primary={contentTitle.text}
          secondary={contentText?.text}
          primaryTypographyProps={getTypographyProps(contentTitle)}
          secondaryTypographyProps={contentText && getTypographyProps(contentText)}
        />

        {banner.right && (
          <ListItemText
            align="right"
            primary={rightTitle?.text}
            secondary={rightText?.text}
            primaryTypographyProps={rightTitle && getTypographyProps(rightTitle)}
            secondaryTypographyProps={rightText && getTypographyProps(rightText)}
          />
        )}
      </ListItem>
    </Banner>
  );
};

export default observer(AppContextBanner);
