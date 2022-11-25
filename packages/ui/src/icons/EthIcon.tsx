import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const EthIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 11 17">
    <path
      d="M5.25545 0.0065918L5.14795 0.3711V10.9483L5.25545 11.0553L10.1771 8.15316L5.25545 0.0065918Z"
      fill="#343434"
    />
    <path d="M5.2556 0.0065918L0.333984 8.15316L5.2556 11.0554V5.92153V0.0065918Z" fill="#8C8C8C" />
    <path d="M5.2554 11.9849L5.19482 12.0586V15.8264L5.2554 16.003L10.1799 9.08423L5.2554 11.9849Z" fill="#3C3C3B" />
    <path d="M5.2556 16.003V11.9849L0.333984 9.08423L5.2556 16.003Z" fill="#8C8C8C" />
    <path d="M5.25537 11.0554L10.1769 8.15327L5.25537 5.92163V11.0554Z" fill="#141414" />
    <path d="M0.333984 8.15327L5.25552 11.0554V5.92163L0.333984 8.15327Z" fill="#393939" />
  </SvgIcon>
));
