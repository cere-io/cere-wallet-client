import { useIsMobile } from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';

export const WalletLayout = (props: WalletLayoutProps) => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileLayout {...props} /> : <DesktopLayout {...props} />;
};
