import { useIsMobile } from '@cere-wallet/ui';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';
import { WalletLayoutProps } from './types';

export const WalletLayout = (props: WalletLayoutProps) => {
  const isMobile = useIsMobile();

  return isMobile ? <MobileLayout {...props} /> : <DesktopLayout {...props} />;
};
