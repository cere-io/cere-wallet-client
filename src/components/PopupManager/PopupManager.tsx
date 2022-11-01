import { Dialog, DialogContent } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { usePopupManagerStore } from '~/hooks';

const PopupManager = () => {
  const store = usePopupManagerStore();

  return (
    <>
      {store.modals.map(({ open, instanceId }) => (
        <Dialog
          key={instanceId}
          open={open}
          onClose={() => store.closePopup(instanceId)}
          TransitionProps={{
            onExited: () => store.disposeModal(instanceId),
          }}
        >
          <DialogContent>{instanceId}</DialogContent>
        </Dialog>
      ))}
    </>
  );
};

export default observer(PopupManager);
