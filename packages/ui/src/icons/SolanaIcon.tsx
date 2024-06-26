import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const SolanaIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="100 100 300 300">
    <path
      d="M115.6 226.1H347c2.9 0 5.6 1.1 7.6 3.2l36.6 36.8c6.8 6.8 2 18.4-7.6 18.4H152.2c-2.9 0-5.6-1.1-7.6-3.2L108 244.5c-6.8-6.7-2-18.4 7.6-18.4zm-7.7-48.8 36.6-36.8c2.1-2.1 4.8-3.2 7.6-3.2h231.3c9.6 0 14.5 11.6 7.6 18.4l-36.5 36.8c-2 2.1-4.8 3.2-7.6 3.2H115.6c-9.6 0-14.4-11.6-7.7-18.4zm283.2 156.2-36.6 36.9c-2 2-4.8 3.2-7.6 3.2H115.6c-9.6 0-14.4-11.6-7.7-18.4l36.6-36.9c2.1-2 4.8-3.2 7.6-3.2h231.3c9.7-.1 14.6 11.5 7.7 18.4z"
      fill="url(#solana-gradient)"
    />

    <defs>
      <linearGradient
        id="solana-gradient"
        x1={242.52}
        x2={755.68}
        y1={267.33}
        y2={-245.83}
        gradientTransform="matrix(.5 0 0 .5 0 250)"
        gradientUnits="userSpaceOnUse"
      >
        <stop
          offset={0}
          style={{
            stopColor: '#cb4ee8',
          }}
        />
        <stop
          offset={1}
          style={{
            stopColor: '#10f4b1',
          }}
        />
      </linearGradient>
    </defs>
  </SvgIcon>
));
