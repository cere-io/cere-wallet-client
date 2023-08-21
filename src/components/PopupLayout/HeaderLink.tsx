import { Link, Stack, Typography } from '@cere-wallet/ui';
import { ReactNode } from 'react';

export type HeaderLinkProps = {
  title: string;
  label?: ReactNode;
  url?: string;
};

export const HeaderLink = ({ title, label, url }: HeaderLinkProps) => (
  <Stack spacing={1} direction="row" alignItems="center">
    <Typography variant="body2" fontWeight="medium" color="primary.light">
      {title}
    </Typography>

    {!url ? (
      <Typography color="#f32758" variant="body2">
        {label}
      </Typography>
    ) : (
      <Link color="#f32758" target="_blank" href={url} variant="body2">
        {label}
      </Link>
    )}
  </Stack>
);
