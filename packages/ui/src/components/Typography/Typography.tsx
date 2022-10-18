import { Typography as MuiTypography, TypographyProps as MuiTypographyProps } from '@mui/material';

import * as React from 'react';

export enum FontWeight {
  'bold' = 700,
  'semibold' = 600,
  'medium' = 500,
  'regular' = 400,
  'light' = 300,
}

interface additionalProps {
  fontWeight?: 'bold' | 'semibold' | 'medium' | 'regular' | 'light';
}

export type TypographyProps = MuiTypographyProps & additionalProps;

export const Typography = ({ fontWeight, children, ...props }: TypographyProps) => {
  return (
    // @ts-ignore
    <MuiTypography fontWeight={fontWeight ? FontWeight[fontWeight] : undefined} {...props}>
      {children}
    </MuiTypography>
  );
};
