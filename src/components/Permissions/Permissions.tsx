import { List, ListItem, ListItemText, Checkbox, ListItemIcon } from '@cere-wallet/ui';
import type { PermissionRequest } from '@cere-wallet/wallet-engine';

import { AllowedPermission, defaultDescription, knownPermissions } from './knownPermissions';

export type PermissionsProps = {
  permissions: PermissionRequest;
  value: PermissionRequest;
  onChange?: (permissions: PermissionRequest) => void;
};

export const Permissions = ({ value, permissions, onChange }: PermissionsProps) => {
  const updateSelection = (capability: string, add: boolean) => {
    const { [capability]: deleted, ...next } = value;

    onChange?.(add ? { ...next, [capability]: permissions[capability] } : next);
  };

  return (
    <List dense disablePadding>
      {Object.keys(permissions).map((capability) => (
        <ListItem key={capability} disableGutters disablePadding>
          <ListItemIcon>
            <Checkbox
              checked={!!value[capability]}
              onChange={(event) => updateSelection(capability, event.target.checked)}
            />
          </ListItemIcon>
          <ListItemText
            primary={knownPermissions[capability as AllowedPermission]?.title || capability}
            secondary={knownPermissions[capability as AllowedPermission]?.description || defaultDescription}
          />
        </ListItem>
      ))}
    </List>
  );
};
