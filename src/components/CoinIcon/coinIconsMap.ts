import { ComponentType } from 'react';
import { MaticIcon, UsdcIcon } from '@cere-wallet/ui';

export const coinIconsMap: Record<string, ComponentType> = {
  matic: MaticIcon,
  usdc: UsdcIcon,
};
