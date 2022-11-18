import { PropsWithChildren } from 'react';
import { Card, CardContent, CardMedia, CardProps, NoImageIcon, ShareIcon, Stack, Typography } from '@cere-wallet/ui';

type CollectibleListItemProps = PropsWithChildren<
  CardProps & {
    imgUrl?: string;
    title: string;
    description?: string;
  }
>;

export const CollectibleListItem = ({ children, imgUrl, title, description, ...props }: CollectibleListItemProps) => {
  return (
    <Card {...props} sx={{ maxHeight: 244 }}>
      {imgUrl && <CardMedia component="img" alt={title} height={164} image={imgUrl} loading="lazy" />}
      {!imgUrl && (
        <Stack alignItems="center" justifyContent="center" height={164} sx={{ background: '#F5F5F7' }}>
          <NoImageIcon sx={{ height: 120, width: 'auto' }} />
        </Stack>
      )}
      <CardContent>
        <Typography gutterBottom variant="subtitle1" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
          {title}
        </Typography>
        <Stack direction="row" justifyContent="space-between">
          <Typography gutterBottom variant="body2" textOverflow="ellipsis" whiteSpace="nowrap" overflow="hidden">
            {description}
          </Typography>
          <ShareIcon />
        </Stack>
      </CardContent>
    </Card>
  );
};
