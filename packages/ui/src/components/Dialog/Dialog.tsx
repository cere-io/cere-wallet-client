import { SyntheticEvent } from 'react';
import {
  styled,
  Box,
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  dialogContentClasses,
  dialogTitleClasses,
} from '@mui/material';

import { CloseIcon } from '../../icons';
import { IconButton } from '../IconButton';
import { Transition } from './Transition';
import { useIsMobile } from '../../hooks';

export type DialogProps = Omit<MuiDialogProps, 'onClose'> & {
  showClose?: boolean;
  onClose?: (event: SyntheticEvent, reason: 'backdropClick' | 'escapeKeyDown' | 'closeClick') => void;
};

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
}));

const Wrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'showClose',
})<Pick<DialogProps, 'showClose'>>(({ theme, showClose }) =>
  !showClose
    ? {}
    : {
        position: 'relative',

        [`& .${dialogContentClasses.root}`]: {
          paddingTop: theme.spacing(8),
        },

        [`& .${dialogTitleClasses.root}`]: {
          paddingRight: theme.spacing(8),
        },
      },
);

export const Dialog = ({ showClose = true, children, onClose, ...props }: DialogProps) => {
  const isMobile = useIsMobile();

  return (
    <MuiDialog TransitionComponent={Transition} fullScreen={isMobile} {...props} onClose={onClose}>
      <Wrapper showClose={showClose}>
        {children}
        {showClose && (
          <CloseButton variant="filled" size="small" onClick={(event) => onClose?.(event, 'closeClick')}>
            <CloseIcon />
          </CloseButton>
        )}
      </Wrapper>
    </MuiDialog>
  );
};
