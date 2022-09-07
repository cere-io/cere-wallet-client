import { ReactElement } from 'react';
import { Typography, Stack, useIsMobile } from '@cere-wallet/ui';

export type PageHeaderProps = {
  title: string;
  rightElement?: ReactElement;
};

export const PageHeader = ({ title, rightElement }: PageHeaderProps) => {
  const isMobile = useIsMobile();

  return isMobile ? null : (
    <Stack direction="row" justifyContent="space-between" alignItems="center" marginBottom={2} height={40}>
      <Typography variant="h5">{title}</Typography>

      {rightElement}
    </Stack>
  );
};
