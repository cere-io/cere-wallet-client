import { Box, BoxProps, Portal, styled, GlobalStyles, dialogClasses, backdropClasses } from '@mui/material';
import { useState } from 'react';

import { BannerPlaceProps, bannerPlacementIdMap } from './BannerPlace';

export type BannerProps = BoxProps & {
  height?: number;
  placement?: BannerPlaceProps['placement'];
};

const BannerContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: theme.zIndex.modal + 1,
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0px 2px 12px rgba(0, 0, 0, 0.1)', // TODO: Use the shadow from theme (should be controlled by `elevation` prop)
}));

export const Banner = ({ placement = 'top', height, ...props }: BannerProps) => {
  const container = document.getElementById(bannerPlacementIdMap[placement]);
  const [detectedHeight, setDetectedHeight] = useState(0);
  const resultHeight = height || detectedHeight;

  const updateHeight = (element: HTMLDivElement | null) => {
    element && setDetectedHeight(element.clientHeight);
  };

  if (!container) {
    throw new Error('Banner placement not found');
  }

  return (
    <>
      <Portal container={container}>
        <BannerContent ref={updateHeight} {...props} />
      </Portal>

      {!!resultHeight && (
        <GlobalStyles
          styles={{
            [`html .${dialogClasses.root}, html .${backdropClasses.root}`]: {
              top: resultHeight,
            },
          }}
        />
      )}
    </>
  );
};
