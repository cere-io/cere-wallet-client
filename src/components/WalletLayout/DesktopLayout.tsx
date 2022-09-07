import { useLocation } from 'react-router-dom';
import { styled, Stack, Box, Tabs, Tab, Logo } from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { AccountDropdown } from '../AccountDropdown';
import { Link } from '../Link';

const Header = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: theme.palette.divider,
}));

const HeaderContent = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
});

const HeaderLeft = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: theme.spacing(4),
}));

const HeaderRight = styled(HeaderLeft)(({ theme }) => ({
  left: 'auto',
  right: theme.spacing(4),
}));

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
        <HeaderLeft>
          <Logo label="Cere wallet" />
        </HeaderLeft>

        <HeaderContent>
          <Tabs value={pathname} sx={{ marginBottom: '-1px' }}>
            {menu.map(({ icon, label, path }) => (
              <Tab key={path} icon={icon} iconPosition="start" to={path} value={path} label={label} component={Link} />
            ))}
          </Tabs>
        </HeaderContent>

        <HeaderRight>
          <AccountDropdown />
        </HeaderRight>
      </Header>
      <Content>{children}</Content>
    </Stack>
  );
};
