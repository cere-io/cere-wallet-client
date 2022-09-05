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
} from '@cere-wallet/ui';

import { AccountInfo } from '../AccountInfo';
import { useAccountStore } from '~/hooks';

export type AccountDropdownProps = {};

const AccountDropdown = (props: AccountDropdownProps) => {
  const { userInfo } = useAccountStore();
  const [open, setOpen] = useState(false);

  if (!userInfo) {
    return null;
  }

  return (
    <Dropdown
      open={open}
      onToggle={setOpen}
      label={userInfo.email}
      leftElement={<Avatar src={userInfo.profileImage} />}
    >
      <Stack width={350} spacing={2}>
        <AccountInfo />

        <MenuList disablePadding>
          <MenuItem>
            <ListItemIcon>
              <HelpIcon />
            </ListItemIcon>
            <ListItemText>Help</ListItemText>
          </MenuItem>

          <Divider />

          <MenuItem>
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
