import {
  styled,
  Banner,
  BannerProps,
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TypographyProps,
  Badge,
  BackIcon,
  IconButton,
  WindowIcon,
  PhotoOutlinedIcon,
  LanguageIcon,
} from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import { useAppContextStore } from '~/hooks';

export type AppContextBannerProps = BannerProps & {
  variant?: 'app' | 'banner';
  hideBackButton?: boolean;
};

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

const Thumbnail = styled(Avatar)(({ theme }) => ({
  width: 35,
  height: 35,
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.paper,
}));

const getTypographyProps = ({ variant, color }: Row) => ({
  ...typographyPropsMap[variant],
  color: color || typographyPropsMap[variant].color,
});

const AppContextBanner = ({ variant, hideBackButton = false, ...props }: AppContextBannerProps) => {
  const { banner } = useAppContextStore();

  const handleBackClick = useCallback(() => {
    window.close();
  }, []);

  if (!banner || (variant && variant !== banner.variant)) {
    return null;
  }

  const hasBackButton = !hideBackButton && (banner.hasBackButton ?? true);
  const [contentTitle, contentText] = banner.content;
  const [rightTitle, rightText] = banner.right || [];
  const FallbackIcon = banner.variant === 'app' ? WindowIcon : PhotoOutlinedIcon;

  const appBadgeElement = banner.variant === 'app' && !banner.thumbnailUrl && (
    <LanguageIcon color="primary" fontSize="small" />
  );

  return (
    <Banner paddingLeft={hasBackButton ? 1.5 : 2} paddingRight={2} paddingY={0.5} {...props}>
      <ListItem disablePadding>
        {hasBackButton && (
          <IconButton sx={{ marginRight: 1 }} onClick={handleBackClick}>
            <BackIcon />
          </IconButton>
        )}

        <ListItemAvatar>
          <Badge
            invisible={!banner.badgeUrl && !appBadgeElement}
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={<BadgeImage src={banner.badgeUrl}>{appBadgeElement}</BadgeImage>}
          >
            <Thumbnail variant="rounded" src={banner.thumbnailUrl}>
              <FallbackIcon sx={{ width: '100%', height: '100%' }} />
            </Thumbnail>
          </Badge>
        </ListItemAvatar>

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
