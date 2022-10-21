import { ElementType } from 'react';
import { Typography as MuiTypography, TypographyProps as MuiTypographyProps, TypographyTypeMap } from '@mui/material';

export type TypographyProps<D extends ElementType = TypographyTypeMap['defaultComponent'], P = {}> = Omit<
  MuiTypographyProps<D, P>,
  'fontWeight'
> & {
  fontWeight?: 'bold' | 'semibold' | 'medium' | 'regular' | 'light';
};

export const Typography = <D extends ElementType = TypographyTypeMap['defaultComponent'], P = {}>(
  props: TypographyProps<D, P>,
) => <MuiTypography {...props} />;
