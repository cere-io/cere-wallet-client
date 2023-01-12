import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const RemoveIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16">
    <line
      x1="2.34961"
      y1="8.05005"
      x2="13.6496"
      y2="8.05005"
      stroke="#ED2121"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </SvgIcon>
));
