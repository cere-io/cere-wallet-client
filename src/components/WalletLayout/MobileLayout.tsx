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
} from '@cere-wallet/ui';

import { WalletLayoutProps } from './types';
import { Link } from '../Link';

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
  width: '80vw',
  boxSizing: 'border-box',
}));

const SidebarHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  height: '48px',
});

const SidebarContent = styled(Box)({
  flex: 1,
});

const SidebarFooter = styled(Box)({});

const CloseButton = styled(IconButton)({
  backgroundColor: '#F5F5F7',

  '&:hover': {
    backgroundColor: '#F5F5F7',
  },
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

          <SidebarContent>
            <Box sx={{ borderRadius: 4, padding: 10, border: '1px solid #E7E8EB' }}>Coming soon...</Box>

            <MenuList>
              {menu.map(({ icon, label, path }) => (
                <MenuItem key={path} selected={active?.path === path} to={path} component={Link} onClick={handleClose}>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'button' }}>{label}</ListItemText>
                </MenuItem>
              ))}
            </MenuList>
          </SidebarContent>
          <SidebarFooter>Coming soon...</SidebarFooter>
        </Sidebar>
      </Drawer>
    </>
  );
};
