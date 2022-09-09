import { IconProps, RemoveCircleOutlineIcon } from '@cere-wallet/ui';

import { coinIconsMap } from './coinIconsMap';

export type CoinIconProps = IconProps & {
  coin: string;
};

export const CoinIcon = ({ coin, ...props }: CoinIconProps) => {
  const Icon = coinIconsMap[coin] || RemoveCircleOutlineIcon;

  return <Icon {...props} />;
};
