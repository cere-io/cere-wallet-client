import { useCallback, SyntheticEvent, PropsWithChildren } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, Backdrop, styled, CereLightIcon, Paper } from '@cere-wallet/ui';

import { useEmbeddedWalletStore, useFullScreen } from '~/hooks';

export type WidgetProps = PropsWithChildren<{}>;

const Overlay = styled(Backdrop)({
  alignItems: 'flex-end',
  justifyContent: 'flex-start',
});

const WidgetButton = styled(IconButton)(({ theme }) => ({
  width: 56,
  height: 56,
  zIndex: 1,

  margin: theme.spacing(0, 0, 1.5, 1.5),
  color: theme.palette.common.white,
  backgroundColor: theme.palette.primary.main,

  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

const WidgetContent = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  overflow: 'hidden',
  borderRadius: 16,
  bottom: theme.spacing(4),
  left: theme.spacing(4),
  padding: theme.spacing(1.5),
  maxWidth: '85vw',
}));

const Widget = ({ children }: WidgetProps) => {
  const [isFullscreen] = useFullScreen();
  const store = useEmbeddedWalletStore();

  const handleOpen = useCallback(
    (event: SyntheticEvent) => {
      event.stopPropagation();

      store.isWidgetOpened = !store.isWidgetOpened;
    },
    [store],
  );

  const handleClose = useCallback(() => {
    store.isWidgetOpened = false;
  }, [store]);

  return (
    <Overlay open invisible onClick={handleClose}>
      <WidgetButton size="large" color="primary" onClick={handleOpen}>
        <CereLightIcon fontSize="inherit" />
      </WidgetButton>
      {store.isWidgetOpened && isFullscreen && (
        <WidgetContent variant="outlined" onClick={(event) => event.stopPropagation()}>
          {children}
        </WidgetContent>
      )}
    </Overlay>
  );
};

export default observer(Widget);
