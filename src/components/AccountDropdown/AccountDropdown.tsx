import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Avatar, Stack } from '@cere-wallet/ui';

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
      <Stack width={350}>
        <AccountInfo />
      </Stack>
    </Dropdown>
  );
};

export default observer(AccountDropdown);
