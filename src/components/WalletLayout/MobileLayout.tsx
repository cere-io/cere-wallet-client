import { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
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
} from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { Link } from '../Link';
import { AccountInfo } from '../AccountInfo';

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

const Content = styled(Box)(({ theme }) => ({
  padding: theme.spacing(0, 2),
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

const MenuItemText = styled(ListItemText)({
  flexGrow: 0,
});

export const MobileLayout = ({ children, menu }: WalletLayoutProps) => {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const handleClose = useCallback(() => setOpen(false), []);
  const active = useMemo(() => menu.find((item) => item.path === pathname), [menu, pathname]);

  return (
    <>
      <Stack spacing={2}>
        <Header>
          <Logo />
          <HeaderContent>{active?.label}</HeaderContent>
          <IconButton onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Header>
        <Content>{children}</Content>
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
                <MenuItem key={path} selected={active?.path === path} to={path} component={Link} onClick={handleClose}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <MenuItemText>
                    {label}
                    {comingSoon && <Chip size="small" color="secondary" label="Soon" sx={{ marginLeft: 1 }} />}
                  </MenuItemText>
                </MenuItem>
              ))}

              <MenuItem onClick={handleClose}>
                <ListItemIcon>
                  <HelpIcon />
                </ListItemIcon>
                <MenuItemText>Help</MenuItemText>
              </MenuItem>
            </MenuList>
          </SidebarContent>
          <SidebarFooter>
            <MenuItem>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <MenuItemText>Log Out</MenuItemText>
            </MenuItem>
          </SidebarFooter>
        </Sidebar>
      </Drawer>
    </>
  );
};
