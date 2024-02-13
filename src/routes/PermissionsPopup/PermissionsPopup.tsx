import { observer } from 'mobx-react-lite';

import { usePopupStore } from '~/hooks';
import { PermissionsPopupStore } from '~/stores';
import { PopupLayout, Permissions } from '~/components';
import { Link, Typography } from '@cere-wallet/ui';

const PermissionsPopup = () => {
  const store = usePopupStore((popupId, isLocal) => new PermissionsPopupStore(popupId, isLocal));

  return (
    <PopupLayout
      title="Permissions Request"
      confirmLabel="Approve"
      cancelLabel="Reject"
      loading={!store.isReady}
      onCancel={store.decline}
      onConfirm={store.approve}
    >
      {store.app && (
        <PopupLayout.Section spacing={1}>
          <Typography variant="body1" fontWeight="medium">
            Requested from
          </Typography>
          <Link href={store.app.url}>{store.app.name}</Link>
        </PopupLayout.Section>
      )}

      {store.permissions && (
        <PopupLayout.Section title="Permissions" spacing={1}>
          <Typography variant="h4">Permissions</Typography>
          <Permissions
            value={store.selectedPermissions}
            permissions={store.permissions}
            onChange={(permissions) => {
              store.selectedPermissions = permissions;
            }}
          />
        </PopupLayout.Section>
      )}
    </PopupLayout>
  );
};

export default observer(PermissionsPopup);
