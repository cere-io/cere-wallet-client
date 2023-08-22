import { Link, Stack, Typography } from '@cere-wallet/ui';
import { ReactNode } from 'react';

export type HeaderLinkProps = {
  title: string;
  label?: ReactNode;
  url?: string;
  isGame?: boolean;
};

export const HeaderLink = ({ title, label, url, isGame }: HeaderLinkProps) => (
  <Stack spacing={1} direction="row" alignItems="center">
    <Typography variant="body2" fontWeight="medium" color={isGame ? 'primary.light' : 'text.primary'}>
      {title}
    </Typography>

    {!url ? (
      <Typography color={isGame ? 'rgba(243, 39, 88, 1)' : 'text.primary'} variant="body2">
        {label}
      </Typography>
    ) : (
      <Link color={isGame ? 'rgba(243, 39, 88, 1)' : 'primary.main'} target="_blank" href={url} variant="body2">
        {label}
      </Link>
    )}
  </Stack>
);
