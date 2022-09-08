import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const TransactionOutIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 18 18">
    <path
      d="M3 13 15 1m0 0v8m0-8H7M1 17h16"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));
