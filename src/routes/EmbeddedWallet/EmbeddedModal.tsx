import { useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { useFullScreen, usePopupManagerStore } from '~/hooks';
import { PopupManagerModal } from '~/stores';
import { RouteElement } from '../RouteElement';

type EmbeddedModalProps = {
  modal: Required<PopupManagerModal>;
};

const EmbeddedModal = ({ modal }: EmbeddedModalProps) => {
  const popupStore = usePopupManagerStore();
  const [isFullscreen, setFullscreen] = useFullScreen();

  const onClose = useCallback(() => popupStore.hideModal(modal.instanceId), [modal, popupStore]);
  const onExited = useCallback(() => popupStore.unregisterAll(modal.instanceId), [modal, popupStore]);

  useEffect(() => {
    setFullscreen(true);

    return () => setFullscreen(false);
  }, [modal, setFullscreen]);

  return (
    <Dialog
      origin="right"
      maxWidth="xs"
      open={modal.open && isFullscreen}
      onClose={onClose}
      TransitionProps={{ onExited }}
    >
      <DialogContent>
        <RouteElement
          path={modal.path}
          context={{
            preopenInstanceId: modal.instanceId,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default observer(EmbeddedModal);
