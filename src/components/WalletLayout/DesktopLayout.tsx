import { useLocation } from 'react-router-dom';
import { styled, Stack, Box, Tabs, Tab, Logo } from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { AccountDropdown } from '../AccountDropdown';
import { Link } from '../Link';

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #E7E8EB',
  padding: theme.spacing(0, 4),
}));

const HeaderContent = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
});

const Content = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 4),
  width: '100%',
  maxWidth: 990,
  alignSelf: 'center',
}));

export const DesktopLayout = ({ children, menu }: WalletLayoutProps) => {
  const { pathname } = useLocation();

  return (
    <Stack spacing={4} marginY={2}>
      <Header>
        <Logo label="Cere wallet" />

        <HeaderContent>
          <Tabs value={pathname} sx={{ marginBottom: '-1px' }}>
            {menu.map(({ icon, label, path }) => (
              <Tab key={path} icon={icon} iconPosition="start" to={path} value={path} label={label} component={Link} />
            ))}
          </Tabs>
        </HeaderContent>

        <AccountDropdown />
      </Header>
      <Content>{children}</Content>
    </Stack>
  );
};
