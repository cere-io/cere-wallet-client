import { List, ListItem, ListItemText, Checkbox, ListItemIcon } from '@cere-wallet/ui';
import type { Permission } from '@cere-wallet/wallet-engine';
import { AllowedPermission, defaultDescription, knownPermissions } from './knownPermissions';

export type PermissionsProps = {
  permissions: Permission[];
  selected: Permission['parentCapability'][];
  onSelect?: (permissions: Permission['parentCapability'][]) => void;
};

export const Permissions = ({ selected, permissions, onSelect }: PermissionsProps) => {
  const updateSelection = (capability: string, add: boolean) => {
    const nextSelected = add ? [capability, ...selected] : selected.filter((item) => item !== capability);

    onSelect?.(nextSelected);
  };

  return (
    <List dense disablePadding>
      {permissions.map(({ parentCapability }) => (
        <ListItem key={parentCapability} disableGutters disablePadding>
          <ListItemIcon>
            <Checkbox
              checked={selected.includes(parentCapability)}
              onChange={(event) => updateSelection(parentCapability, event.target.checked)}
            />
          </ListItemIcon>
          <ListItemText
            primary={knownPermissions[parentCapability as AllowedPermission]?.title || parentCapability}
            secondary={knownPermissions[parentCapability as AllowedPermission]?.description || defaultDescription}
          />
        </ListItem>
      ))}
    </List>
  );
};
