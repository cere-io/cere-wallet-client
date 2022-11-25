import { CereIcon, MaticIcon, UsdcIcon, EthIcon, UsdtIcon } from '@cere-wallet/ui';
import { ComponentType } from 'react';

export const coinIconsMap: Record<string, ComponentType> = {
  eth: EthIcon,
  cere: CereIcon,
  matic: MaticIcon,
  usdc: UsdcIcon,
  usdt: UsdtIcon,
};
