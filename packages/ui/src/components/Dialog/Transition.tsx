import { ReactElement, forwardRef } from 'react';
import { Fade, Slide } from '@mui/material';
import { TransitionProps as MuiTransitionProps } from '@mui/material/transitions';
import { useIsMobile } from '../../hooks';

export type TransitionProps = MuiTransitionProps & {
  children: ReactElement;
};

export const Transition = forwardRef((props: TransitionProps, ref: React.Ref<unknown>) => {
  const isMobile = useIsMobile();

  return isMobile ? <Slide direction="up" ref={ref} {...props} /> : <Fade ref={ref} {...props} />;
});
