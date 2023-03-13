import { Typography, Stack } from '@cere-wallet/ui';
import { ReactElement } from 'react';

export const InfoStepperItem = (img: ReactElement, title: string, text: string) => {
  return (
    <Stack direction="column" alignItems="center">
      {img}
      <Typography align="center" variant="h4">
        {title}
      </Typography>
      <Typography align="center" variant="body1" color="text.secondary" minHeight="50px">
        {text}
      </Typography>
    </Stack>
  );
};
