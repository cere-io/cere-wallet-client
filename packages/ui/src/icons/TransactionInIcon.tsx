import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const TransactionInIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 18 18">
    <path
      d="M1 17h16M14.332 1l-12 12m0 0V4.333m0 8.667H11"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </SvgIcon>
));
