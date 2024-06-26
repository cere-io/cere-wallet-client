import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  Dropdown,
  Avatar,
  Stack,
  MenuList,
  MenuItem,
  HelpIcon,
  ListItemIcon,
  ListItemText,
  Divider,
  LogoutIcon,
  Truncate,
  Link,
} from '@cere-wallet/ui';

import { useAccountStore, useAuthenticationStore } from '~/hooks';
import { WALLET_HELP_URL } from '~/constants';
import { AccountInfo } from '../AccountInfo';

export type AccountDropdownProps = {};

const AccountDropdown = (props: AccountDropdownProps) => {
  const authStore = useAuthenticationStore();
  const { user } = useAccountStore();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <Dropdown
      open={open}
      onToggle={setOpen}
      label={<Truncate text={user.email} variant="email" maxLength={20} />}
      leftElement={<Avatar src={user.avatar} />}
    >
      <Stack width={350} spacing={2}>
        <AccountInfo />

        <MenuList disablePadding>
          <MenuItem component={Link} target="_blank" href={WALLET_HELP_URL}>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText>Help</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem onClick={() => authStore.logout()}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText>Log Out</ListItemText>
          </MenuItem>
        </MenuList>
      </Stack>
    </Dropdown>
  );
};

export default observer(AccountDropdown);
