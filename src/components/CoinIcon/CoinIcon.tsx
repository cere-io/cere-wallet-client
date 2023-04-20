import { IconProps, RemoveCircleOutlineIcon, Avatar } from '@cere-wallet/ui';

import { coinIconsMap } from './coinIconsMap';
import { COIN_TICKER_ALIAS } from '~/constants';

export type CoinIconProps = IconProps & {
  coin: string;
  thumb?: string;
};

export const CoinIcon = ({ coin, thumb, ...props }: CoinIconProps) => {
  if (thumb) {
    return <Avatar sx={{ width: 32, height: 32 }} src={thumb} alt={thumb} title={thumb} />;
  }

  const ticker = COIN_TICKER_ALIAS[coin] || coin;
  const Icon = coinIconsMap[ticker.toLocaleLowerCase()] || RemoveCircleOutlineIcon;

  return <Icon {...props} />;
};
