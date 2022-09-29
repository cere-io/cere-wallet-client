import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const TopUpIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 16 16">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2H3.5a1 1 0 0 0 0 2H16v9a2 2 0 0 1-2 2H9V9.914l.793.793a1 1 0 0 0 1.414-1.414l-2.5-2.5a1 1 0 0 0-1.414 0l-2.5 2.5a1 1 0 0 0 1.414 1.414L7 9.914V15H2a2 2 0 0 1-2-2V2Z"
      fill="currentColor"
    />
  </SvgIcon>
));
