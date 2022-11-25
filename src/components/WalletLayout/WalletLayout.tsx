import { useIsMobile, Stack } from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { DesktopHeader } from './DesktopHeader';
import { MobileHeader } from './MobileHeader';
import { Box, styled } from '@cere/ui';

const Content = styled(Box)(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(0, 4),
    width: '100%',
    maxWidth: 990,
    alignSelf: 'center',
  },
  padding: theme.spacing(0, 2),
}));

export const WalletLayout = ({ children, menu }: WalletLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <Stack spacing={isMobile ? 4 : 2} marginY={isMobile ? 2 : 0}>
      {isMobile ? <MobileHeader menu={menu} /> : <DesktopHeader menu={menu} />}
      <Content>{children}</Content>
    </Stack>
  );
};
