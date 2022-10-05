import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const TransferIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 18 18">
    <path d="M9 4.5h8M9 13.5h8" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
    <path
      d="M1 9h7.5m0 0-3-3m3 3-3 3"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 9h5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </SvgIcon>
));
