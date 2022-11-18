import { ReactElement } from 'react';
import { Stack, Typography, styled, svgIconClasses } from '@mui/material';
import { CereIcon } from '../../icons';

type LogoSize = 'large' | 'medium' | 'small';

export type LogoProps = {
  icon?: ReactElement;
  label?: string;
  size?: LogoSize;
};

const sizesMap: Record<LogoSize, number> = {
  large: 40,
  medium: 28,
  small: 20,
};

const Container = styled(Stack)({
  [`& .${svgIconClasses.root}`]: {
    fontSize: 'inherit',
  },
});

export const Logo = ({ label, size = 'medium', icon = <CereIcon /> }: LogoProps) => (
  <Container direction="row" alignItems="center" spacing={2} fontSize={sizesMap[size]}>
    {icon}
    {label && (
      <Typography noWrap fontWeight="bold">
        {label}
      </Typography>
    )}
  </Container>
);
