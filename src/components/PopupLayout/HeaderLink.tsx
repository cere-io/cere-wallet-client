import { Link, Stack, Typography } from '@cere-wallet/ui';

export type HeaderLinkProps = {
  title: string;
  label: string;
  url?: string;
};

export const HeaderLink = ({ title, label, url }: HeaderLinkProps) => (
  <Stack spacing={1} direction="row" alignItems="center">
    <Typography variant="body1" fontWeight="medium">
      {title}
    </Typography>
    <Link target="_blank" href={url} variant="body1">
      {label}
    </Link>
  </Stack>
);
