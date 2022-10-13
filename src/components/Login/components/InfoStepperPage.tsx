import { Typography, useIsMobile } from '@cere-wallet/ui';
import { ReactElement } from 'react';

export const InfoStepperPage = (img: ReactElement, title: string, text: string) => {
  const isMobile = useIsMobile();

  return (
    <>
      {img}
      <Typography variant={isMobile ? 'h2' : 'h4'}>{title}</Typography>
      <Typography variant="body16Regular" color="text.secondary" minHeight="70px">
        {text}
      </Typography>
    </>
  );
};
