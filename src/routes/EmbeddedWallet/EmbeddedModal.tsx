import { forwardRef, Ref, useCallback, useEffect } from 'react';
import { Dialog as UIDialog, DialogContent, Slide, SlideProps, styled, useIsMobile, useTheme } from '@cere-wallet/ui';
import { observer } from 'mobx-react-lite';

import { useFullScreen, usePopupManagerStore } from '~/hooks';
import { PopupManagerModal } from '~/stores';
import { RouteElement } from '../RouteElement';

const Dialog = styled(UIDialog)(({ theme, fullWidth }) => ({
  display: 'flex',
  flexDirection: fullWidth ? 'column' : 'row',

  '.MuiDialog-paper': {
    margin: 0,
    maxHeight: 'none',
    maxWidth: '100vw',
    minWidth: 400,

    ...(fullWidth && {
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    }),
  },

  '.MuiDialog-container': fullWidth
    ? {
        marginTop: 'auto',
        height: `calc(100vh - ${theme.spacing(10)})`,
      }
    : {
        alignItems: 'stretch',
        justifyContent: 'flex-end',
        marginLeft: 'auto',
      },
}));

const Transition = forwardRef((props: SlideProps, ref: Ref<unknown>) => {
  const theme = useTheme();
  const isMobile = useIsMobile();

  return (
    <Slide
      ref={ref}
      direction={isMobile ? 'up' : 'left'}
      {...props}
      timeout={{
        exit: theme.transitions.duration.shorter,
        enter: theme.transitions.duration.short,
      }}
    />
  );
});

type EmbeddedModalProps = {
  modal: Required<PopupManagerModal>;
};

const EmbeddedModal = ({ modal }: EmbeddedModalProps) => {
  const popupStore = usePopupManagerStore();
  const [isFullscreen, setFullscreen] = useFullScreen();
  const isMobile = useIsMobile() && isFullscreen;

  const onClose = useCallback(() => popupStore.hideModal(modal.instanceId), [modal, popupStore]);
  const onExited = useCallback(() => popupStore.unregisterAll(modal.instanceId), [modal, popupStore]);

  useEffect(() => {
    setFullscreen(true);

    return () => setFullscreen(false);
  }, [modal, setFullscreen]);

  return (
    <Dialog
      fullWidth={isMobile}
      open={modal.open && isFullscreen}
      onClose={onClose}
      TransitionProps={{ onExited }}
      TransitionComponent={Transition}
      PaperProps={{ square: true }}
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
