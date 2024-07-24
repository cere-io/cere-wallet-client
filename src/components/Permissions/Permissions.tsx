import { List, ListItem, ListItemText, Checkbox, ListItemIcon } from '@cere-wallet/ui';
import type { PermissionRequest } from '@cere-wallet/wallet-engine';

import { AllowedPermission, knownPermissions } from './knownPermissions';

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
      {Object.keys(permissions).map((capability) => {
        const defaults = knownPermissions[capability as AllowedPermission] || {};
        const permission = { ...defaults, ...permissions[capability as AllowedPermission] };

        return (
          <ListItem key={capability} disableGutters disablePadding>
            <ListItemIcon>
              <Checkbox
                checked={!!value[capability]}
                onChange={(event) => updateSelection(capability, event.target.checked)}
              />
            </ListItemIcon>
            <ListItemText primary={permission.title || capability} secondary={permission.description} />
          </ListItem>
        );
      })}
    </List>
  );
};
