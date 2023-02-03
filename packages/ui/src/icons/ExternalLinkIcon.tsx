import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const ExternalLinkIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path
      d="M16 10.75V14C16 15.1046 15.1046 16 14 16H6C4.89543 16 4 15.1046 4 14V6C4 4.89543 4.89543 4 6 4H9.25"
      fill="none"
      stroke="#733BF5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M10.75 9.25L16 4M16 4H12.25M16 4V7.75" stroke="#733BF5" strokeWidth="1.5" strokeLinecap="round" />
  </SvgIcon>
));
