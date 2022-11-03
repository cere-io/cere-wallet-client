import { useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { useEmbeddedWalletStore, usePopupManagerStore } from '~/hooks';
import { PopupManagerModal } from '~/stores';

type EmbeddedModalProps = {
  modal: PopupManagerModal;
};

const EmbeddedModal = ({ modal }: EmbeddedModalProps) => {
  const store = useEmbeddedWalletStore();
  const popupStore = usePopupManagerStore();

  const onClose = useCallback(() => popupStore.hideModal(modal.instanceId), [modal, popupStore]);
  const onExited = useCallback(() => popupStore.unregisterAll(modal.instanceId), [modal, popupStore]);

  useEffect(() => {
    store.isFullscreen = true;

    return () => {
      store.isFullscreen = false;
    };
  }, [store, modal]);

  return (
    <Dialog open={modal.open} onClose={onClose} TransitionProps={{ onExited }}>
      <DialogContent>{modal.path}</DialogContent>
    </Dialog>
  );
};

export default observer(EmbeddedModal);
