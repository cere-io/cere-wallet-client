import { Typography, Stack } from '@cere-wallet/ui';
import { ReactElement } from 'react';

export const InfoStepperItem = (img: ReactElement, title: string, text: string) => {
  return (
    <Stack direction="column" alignItems="center">
      {img}
      <Typography variant="h4">{title}</Typography>
      <Typography variant="body1" color="text.secondary" minHeight="50px">
        {text}
      </Typography>
    </Stack>
  );
};
