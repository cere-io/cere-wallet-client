import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const NoCoinsIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 155 80">
    <circle cx={127} cy={41} r={26} fill="#fff" stroke="#E7E8EB" strokeWidth={1.5} />
    <circle cx={127} cy={41} r={18} fill="#F8F8F9" stroke="#E7E8EB" strokeWidth={1.5} />
    <path
      d="M127 33v16M135 41h-16M122.333 36.333l10 10M122.333 46.333l10-10"
      stroke="#D0D1D6"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <circle cx={27} cy={41} r={26} fill="#fff" stroke="#E7E8EB" strokeWidth={1.5} />
    <circle cx={27} cy={41} r={18} fill="#F8F8F9" stroke="#E7E8EB" strokeWidth={1.5} />
    <path
      d="M27 33v16M35 41H19M22.333 36.333l10 10M22.333 46.333l10-10"
      stroke="#D0D1D6"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <circle cx={77} cy={41} r={40} fill="#fff" stroke="#E7E8EB" strokeWidth={1.5} />
    <circle cx={77} cy={41} r={30} fill="#F8F8F9" stroke="#E7E8EB" strokeWidth={1.5} />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M79.3 28.224c0-1.228-.982-2.224-2.195-2.224-1.212 0-2.195.996-2.195 2.224v2.432h-2.143c-1.925 0-3.473.85-4.475 2.182-.951 1.264-1.322 2.833-1.29 4.27.031 1.44.47 2.968 1.405 4.189.976 1.273 2.474 2.165 4.36 2.165h7.91c.945 0 1.378.313 1.582.55.234.269.386.694.344 1.224-.082 1.017-.857 2.135-2.604 2.135H69.8c-1.213 0-2.195.996-2.195 2.225 0 1.228.982 2.224 2.195 2.224h5.11v1.956c0 1.228.982 2.224 2.194 2.224 1.213 0 2.195-.996 2.195-2.224V51.82H80c4.194 0 6.725-3.06 6.98-6.222.125-1.56-.296-3.224-1.42-4.521-1.153-1.332-2.86-2.063-4.882-2.063h-7.91c-.403 0-.667-.152-.893-.446-.266-.347-.468-.909-.483-1.558-.014-.651.165-1.173.393-1.475.176-.235.436-.43.983-.43H81.666c1.212 0 2.195-.996 2.195-2.224 0-1.229-.983-2.225-2.195-2.225H79.3v-2.432Z"
      fill="#D0D1D6"
    />
  </SvgIcon>
));
