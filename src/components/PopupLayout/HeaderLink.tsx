import { Link, Stack, Typography } from '@cere-wallet/ui';
import { ReactNode } from 'react';

export type HeaderLinkProps = {
  title: string;
  label?: ReactNode;
  url?: string;
};

export const HeaderLink = ({ title, label, url }: HeaderLinkProps) => (
  <Stack spacing={1} direction="row" alignItems="center">
    <Typography variant="body2" fontWeight="medium">
      {title}
    </Typography>

    {!url ? (
      <Typography variant="body2">{label}</Typography>
    ) : (
      <Link target="_blank" href={url} variant="body2">
        {label}
      </Link>
    )}
  </Stack>
);
