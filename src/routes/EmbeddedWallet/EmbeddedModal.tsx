import { useEffect } from 'react';
import { Dialog, DialogContent } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { useAppContextStore, useFullScreen, usePopupManagerStore } from '~/hooks';
import { PopupManagerModal } from '~/stores';
import { RouteElement } from '../RouteElement';

type EmbeddedModalProps = {
  modal: Required<PopupManagerModal>;
  showClose?: boolean;
};

const EmbeddedModal = ({ modal, showClose }: EmbeddedModalProps) => {
  const popupStore = usePopupManagerStore();
  const [isFullscreen, setFullscreen] = useFullScreen();
  const appContextStore = useAppContextStore();

  useEffect(() => {
    setFullscreen(true);

    return () => setFullscreen(false);
  }, [modal, setFullscreen]);

  return appContextStore.isTelegramMiniApp ? (
    <RouteElement path={modal.path} context={{ preopenInstanceId: modal.instanceId }} />
  ) : (
    <Dialog
      showClose={showClose}
      origin="right"
      maxWidth="xs"
      open={modal.open && isFullscreen}
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

export default observer(EmbeddedModal);
