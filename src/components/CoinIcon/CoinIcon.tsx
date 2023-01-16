import { IconProps, RemoveCircleOutlineIcon } from '@cere-wallet/ui';

import { coinIconsMap } from './coinIconsMap';

export type CoinIconProps = IconProps & {
  coin: string;
  thumb?: string;
};

export const CoinIcon = ({ coin, thumb, ...props }: CoinIconProps) => {
  if (thumb) {
    return <img src={thumb} alt={thumb} title={thumb} />;
  }
  const Icon = coinIconsMap[coin?.toLocaleLowerCase()] || RemoveCircleOutlineIcon;

  return <Icon {...props} />;
};
