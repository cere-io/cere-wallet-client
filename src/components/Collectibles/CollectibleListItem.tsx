import { Card, CardProps, CardMedia, CardContent, Typography, ShareIcon, Stack } from '@cere-wallet/ui';
import { PropsWithChildren } from 'react';

type CollectibleListItemProps = PropsWithChildren<
  CardProps & {
    imgUrl: string;
    title: string;
    description: string;
  }
>;

export const CollectibleListItem = ({ children, imgUrl, title, description, ...props }: CollectibleListItemProps) => {
  return (
    <Card {...props} sx={{ maxHeight: 244 }}>
      <CardMedia component="img" alt={title} height={164} image={imgUrl} loading="lazy" />
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
