import { useCallback, useState } from 'react';
import {
  styled,
  Stack,
  Box,
  IconButton,
  MenuIcon,
  Typography,
  Drawer,
  CloseIcon,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Logo,
  LogoutIcon,
  HelpIcon,
  Chip,
  Link as UILink,
} from '@cere-wallet/ui';

import { WALLET_HELP_URL } from '~/constants';
import { useAuthenticationStore } from '~/hooks';
import { WalletMenuItem } from './types';
import { Link } from '../Link';
import { AccountInfo } from '../AccountInfo';
import { useActiveMenuItem } from './useActiveMenuItem';

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  borderBottom: '1px solid #E7E8EB',
  padding: theme.spacing(0, 2),
  height: '48px',
}));

const HeaderContent = styled(Typography)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  fontWeight: theme.typography.fontWeightBold,
}));

const Sidebar = styled(Stack)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(0, 2, 2),
  width: '92vw',
  boxSizing: 'border-box',
}));

const SidebarHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  height: '48px',
});

const SidebarContent = styled(Stack)({
  flex: 1,
});

const SidebarFooter = styled(Box)(({ theme }) => ({
  paddingTop: theme.spacing(1),
  borderTopWidth: 1,
  borderTopStyle: 'solid',
  borderTopColor: theme.palette.divider,
}));

const CloseButton = styled(IconButton)({
  backgroundColor: '#F5F5F7',

  '&:hover': {
    backgroundColor: '#F5F5F7',
  },
});

export const MobileHeader = ({ menu }: { menu: WalletMenuItem[] }) => {
  const authStore = useAuthenticationStore();
  const [open, setOpen] = useState(false);
  const active = useActiveMenuItem(menu);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <Stack spacing={2}>
        <Header>
          <Logo />
          <HeaderContent>{active.label}</HeaderContent>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Header>
      </Stack>

      <Drawer anchor="right" open={open} onClose={handleClose}>
        <Sidebar spacing={1}>
          <SidebarHeader>
            <CloseButton size="small" onClick={handleClose}>
              <CloseIcon />
            </CloseButton>
          </SidebarHeader>

          <SidebarContent spacing={2}>
            <AccountInfo />

            <MenuList disablePadding>
              {menu.map(({ icon, label, path, comingSoon }) => (
                <MenuItem key={path} selected={active.path === path} to={path} component={Link} onClick={handleClose}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText>
                    {label}
                    {comingSoon && <Chip size="small" color="secondary" label="Soon" sx={{ marginLeft: 1 }} />}
                  </ListItemText>
                </MenuItem>
              ))}

              <MenuItem component={UILink} target="_blank" href={WALLET_HELP_URL}>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <ListItemText>Help</ListItemText>
              </MenuItem>
            </MenuList>
          </SidebarContent>
          <SidebarFooter>
            <MenuItem onClick={() => authStore.logout()}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText>Log Out</ListItemText>
            </MenuItem>
          </SidebarFooter>
        </Sidebar>
      </Drawer>
    </>
  );
};
