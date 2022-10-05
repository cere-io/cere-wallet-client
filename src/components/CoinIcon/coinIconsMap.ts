import { MaticIcon, UsdcIcon } from '@cere-wallet/ui';
import { ComponentType } from 'react';

export const coinIconsMap: Record<string, ComponentType> = {
  matic: MaticIcon,
  usdc: UsdcIcon,
};
