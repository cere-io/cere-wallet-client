import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const AddIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 21 20">
    <line x1="10.5" y1="3" x2="10.5" y2="17" stroke="#733BF5" stroke-width="2" stroke-linecap="round" />
    <line x1="3.5" y1="10" x2="17.5" y2="10" stroke="#733BF5" stroke-width="2" stroke-linecap="round" />
  </SvgIcon>
));