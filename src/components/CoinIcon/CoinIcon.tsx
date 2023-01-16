import { IconProps, RemoveCircleOutlineIcon, Avatar } from '@cere-wallet/ui';

import { coinIconsMap } from './coinIconsMap';

export type CoinIconProps = IconProps & {
  coin: string;
  thumb?: string;
};

export const CoinIcon = ({ coin, thumb, ...props }: CoinIconProps) => {
  if (thumb) {
    return <Avatar sx={{ width: 32, height: 32 }} src={thumb} alt={thumb} title={thumb} />;
  }
  const Icon = coinIconsMap[coin?.toLocaleLowerCase()] || RemoveCircleOutlineIcon;

  return <Icon {...props} />;
};
