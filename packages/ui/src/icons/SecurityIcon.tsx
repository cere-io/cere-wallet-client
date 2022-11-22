import { memo } from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';

export const SecurityIcon = memo((props: SvgIconProps) => (
  <SvgIcon {...props} width="18" height="21" viewBox="0 0 18 21" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 13.0943V4.48532C0 3.77973 0.371798 3.12634 0.978396 2.76592L1.33797 2.55228C6.06062 -0.253754 11.9394 -0.253755 16.662 2.55228L17.0216 2.76592C17.6282 3.12634 18 3.77973 18 4.48532V13.0943C18 13.9846 17.6046 14.829 16.9206 15.399L12.201 19.3321C10.3468 20.8774 7.65325 20.8774 5.79899 19.3321L1.07939 15.399C0.395447 14.829 0 13.9846 0 13.0943ZM8.3142 13.2295L14.1838 7.72948L12.8162 6.27007L7.71092 11.0539L5.26053 8.1838L3.73947 9.48241L6.86991 13.1491L7.54995 13.9456L8.3142 13.2295Z"
      fill="currentColor"
    />
  </SvgIcon>
));
