import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const ArrowLeftIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M7.49754 16.3755C7.84242 16.8069 7.77231 17.4361 7.34094 17.781C6.90957 18.1259 6.2803 18.0558 5.93542 17.6244L2.43715 13.2489C1.85331 12.5186 1.85331 11.4813 2.43715 10.751L5.93542 6.3755C6.2803 5.94414 6.90957 5.87403 7.34094 6.21891C7.77231 6.56379 7.84242 7.19306 7.49754 7.62442L4.79877 11L21.0007 11C21.5529 11 22.0007 11.4477 22.0007 12C22.0007 12.5522 21.5529 13 21.0007 13L4.79877 13L7.49754 16.3755Z"
      fill="currentColor"
    />
  </SvgIcon>
));
