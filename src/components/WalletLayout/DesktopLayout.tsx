import { matchRoutes, useLocation, useMatches } from 'react-router-dom';
import { styled, Stack, Box, Tabs, Tab, Logo, Chip } from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { AccountDropdown } from '../AccountDropdown';
import { Link } from '../Link';
import { useMemo } from 'react';
import { useActiveMenuItem } from './useActiveMenuItem';

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

const SoonChip = styled(Chip)({
  position: 'absolute',
  right: 14,
  top: 0,
});

export const DesktopLayout = ({ children, menu }: WalletLayoutProps) => {
  const active = useActiveMenuItem(menu);

  return (
    <Stack spacing={4} marginY={2}>
      <Header>
        <HeaderLeft>
          <Logo label="Cere wallet" />
        </HeaderLeft>

        <HeaderContent>
          <Tabs value={active.path} sx={{ marginBottom: '-1px' }}>
            {menu.map(({ icon, label, path, comingSoon }) => (
              <Tab
                key={path}
                icon={icon}
                iconPosition="start"
                to={path}
                value={path}
                label={
                  <>
                    {label}
                    {comingSoon && <SoonChip size="small" color="secondary" label="Soon" />}
                  </>
                }
                component={Link}
              />
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
