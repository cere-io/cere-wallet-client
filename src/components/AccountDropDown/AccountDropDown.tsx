import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Dropdown, Avatar, Box } from '@cere-wallet/ui';

export type AccountDropdownProps = {};

export const AccountDropdown = (props: AccountDropdownProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown open={open} onToggle={setOpen} label="sergey.kambalin@cere.io" leftElement={<Avatar />}>
      <Box width="300px" paddingY={5}>
        Coming soon....
      </Box>
    </Dropdown>
  );
};

export default observer(AccountDropdown);
