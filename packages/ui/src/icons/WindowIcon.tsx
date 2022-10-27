import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const WindowIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 33 30">
    <rect x={1} y={1.5} width={31.5} height={27} rx={3} stroke="currentColor" fill="transparent" strokeWidth={1.5} />
    <circle cx={4.375} cy={4.875} r={1.125} fill="currentColor" />
    <circle cx={7.75} cy={4.875} r={1.125} fill="currentColor" />
    <circle cx={11.125} cy={4.875} r={1.125} fill="currentColor" />
    <path stroke="currentColor" strokeWidth={1.5} d="M1 8.625h31.5" />
    <path stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" d="M5.125 15.375h18.75M5.125 21h8.625" />
  </SvgIcon>
));
