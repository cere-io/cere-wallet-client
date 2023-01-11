import { Dialog, DialogContent } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { usePopupManagerStore } from '~/hooks';
import { PopupManagerModal } from '~/stores';
import { RouteElement } from '../RouteElement';

type WalletModalProps = {
  modal: Required<PopupManagerModal>;
};

const WalletModal = ({ modal }: WalletModalProps) => {
  const popupStore = usePopupManagerStore();

  return (
    <Dialog
      origin="center"
      maxWidth="xs"
      open={modal.open}
      onClose={() => popupStore.hideModal(modal.instanceId)}
      TransitionProps={{
        onExited: () => popupStore.unregisterAll(modal.instanceId),
      }}
    >
      <DialogContent>
        <RouteElement path={modal.path} context={{ preopenInstanceId: modal.instanceId }} />
      </DialogContent>
    </Dialog>
  );
};

export default observer(WalletModal);
