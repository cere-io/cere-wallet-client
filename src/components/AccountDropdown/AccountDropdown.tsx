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
} from '@cere-wallet/ui';

import { AccountInfo } from '../AccountInfo';
import { useAccountStore } from '~/hooks';

export type AccountDropdownProps = {};

const AccountDropdown = (props: AccountDropdownProps) => {
  const { account } = useAccountStore();
  const [open, setOpen] = useState(false);

  if (!account) {
    return null;
  }

  return (
    <Dropdown
      open={open}
      onToggle={setOpen}
      label={<Truncate text={account.email} variant="email" maxLength={20} />}
      leftElement={<Avatar src={account.avatar} />}
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
