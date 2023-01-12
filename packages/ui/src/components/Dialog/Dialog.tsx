import { SyntheticEvent } from 'react';
import {
  styled,
  Box,
  Fade,
  Slide,
  Dialog as MuiDialog,
  DialogProps as MuiDialogProps,
  dialogClasses,
  dialogContentClasses,
  dialogTitleClasses,
  SlideProps,
} from '@mui/material';

import { CloseIcon } from '../../icons';
import { IconButton } from '../IconButton';
import { useIsMobile } from '../../hooks';

type DialogOrigin = 'bottom' | 'right' | 'center';

export type DialogProps = Omit<MuiDialogProps, 'onClose'> & {
  showClose?: boolean;
  origin?: DialogOrigin;
  onClose?: (event: SyntheticEvent, reason: 'backdropClick' | 'escapeKeyDown' | 'closeClick') => void;
};

const StyledDialog = styled(MuiDialog)<DialogProps>(({ theme, fullWidth, fullScreen, origin }) => ({
  display: 'flex',
  justifyContent: 'center',

  [`& .${dialogClasses.paper}`]: {
    ...(fullWidth && {
      flex: 1,
      width: 'auto',

      [theme.breakpoints.down('md')]: {
        margin: 0,
        maxWidth: '100vw',
      },
    }),

    ...(fullScreen && {
      flex: 1,
      borderRadius: 0,
    }),

    ...(origin === 'bottom' && {
      marginBottom: 0,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
      maxHeight: `calc(100vh - ${theme.spacing(10)})`,
    }),

    ...(origin === 'right' && {
      margin: 0,
      borderRadius: 0,
      maxHeight: 'none',
      alignSelf: 'stretch',
      minWidth: 450,
    }),
  },

  [`& .${dialogClasses.container}`]: {
    ...((fullWidth || fullScreen) && {
      flex: 1,
    }),

    ...(origin === 'bottom' && {
      height: 'auto',
      marginTop: 'auto',
    }),

    ...(origin === 'right' && {
      marginLeft: 'auto',
    }),

    ...(fullScreen && {
      margin: 0,
    }),
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  right: theme.spacing(2),
  top: theme.spacing(2),
}));

const ContentWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'showClose',
})<Pick<DialogProps, 'showClose'>>(({ theme, showClose }) => ({
  display: 'flex',
  flex: 1,
  overflowY: 'auto',

  ...(showClose && {
    position: 'relative',

    [`& .${dialogContentClasses.root}`]: {
      paddingTop: theme.spacing(8),
    },

    [`& .${dialogTitleClasses.root}`]: {
      paddingRight: theme.spacing(8),
    },
  }),
}));

const originToSlideDirection: Record<DialogOrigin, SlideProps['direction']> = {
  bottom: 'up',
  right: 'left',
  center: undefined,
};

export const Dialog = ({
  maxWidth,
  showClose = true,
  origin: rawOrigin,
  scroll,
  fullWidth,
  TransitionProps,
  children,
  onClose,
  ...props
}: DialogProps) => {
  const isMobile = useIsMobile();
  const mobileOrigin = rawOrigin !== 'center' ? 'bottom' : 'center';
  const origin = isMobile ? mobileOrigin : rawOrigin || 'center';
  const isFullWidth = (isMobile && origin === 'bottom') || fullWidth;

  const transition = origin === 'center' ? Fade : Slide;
  const transitionProps = origin === 'center' ? {} : { direction: originToSlideDirection[origin] };
  const overflowY = scroll === 'paper' ? 'auto' : undefined;

  return (
    <StyledDialog
      {...props}
      fullWidth={isFullWidth}
      origin={origin}
      onClose={onClose}
      TransitionComponent={transition}
      TransitionProps={{
        ...TransitionProps,
        ...transitionProps,
      }}
    >
      <ContentWrapper showClose={showClose} sx={{ overflowY }}>
        {children}
        {showClose && (
          <CloseButton variant="filled" size="small" onClick={(event) => onClose?.(event, 'closeClick')}>
            <CloseIcon />
          </CloseButton>
        )}
      </ContentWrapper>
    </StyledDialog>
  );
};
