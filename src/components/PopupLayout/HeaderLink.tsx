import { Link, Stack, Typography, useWhiteLabel } from '@cere-wallet/ui';
import { ReactNode } from 'react';

export type HeaderLinkProps = {
  title: string;
  label?: ReactNode;
  url?: string;
};

export const HeaderLink = ({ title, label, url }: HeaderLinkProps) => {
  const {
    text: { primary },
    primary: { main },
  } = useWhiteLabel();
  return (
    <Stack spacing={1} direction="row" alignItems="center">
      <Typography variant="body2" fontWeight="medium" color={primary}>
        {title}
      </Typography>

      {!url ? (
        <Typography color={primary} variant="body2">
          {label}
        </Typography>
      ) : (
        <Link color={main} target="_blank" href={url} variant="body2">
          {label}
        </Link>
      )}
    </Stack>
  );
};
