import { PropsWithChildren, useMemo } from 'react';
import { styled, Button, Logo, Container, Typography, Loading, useIsMobile, LoadingButton } from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';
import { HeaderLink, HeaderLinkProps } from './HeaderLink';
import { Section } from './Section';
import { CereLogo } from '~/components';

export type PopupLayoutProps = PropsWithChildren<{
  title?: string;
  network?: string;
  links?: HeaderLinkProps[];
  loading?: boolean;
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

const Layout = styled(Container)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
}));

export const PopupLayout = ({
  title = 'Confirm transaction',
  loading = false,
  confirming = false,
  network,
  links: rawLinks,
  children,
  onCancel,
  onConfirm,
}: PopupLayoutProps) => {
  const isMobile = useIsMobile(); // TODO: It would be better to use auto-adaptive font sizes instead of using this hook
  const links = useMemo(() => rawLinks?.filter(Boolean), [rawLinks]);

  return loading ? (
    <Loading fullScreen>
      <Logo />
    </Loading>
  ) : (
    <Layout disableGutters maxWidth="sm">
      <Section spacing={3} alignItems="center">
        <CereLogo />
        <Typography variant={isMobile ? 'h4' : 'h3'} color="primary.light">
          {title}
        </Typography>
        {network && !loading && <NetworkLabel label={network} />}
      </Section>

      {links && (
        <Section>
          {links.map((linkProps) => (
            <HeaderLink key={linkProps.title} {...linkProps} />
          ))}
        </Section>
      )}

      {children}

      <Section direction="row" alignSelf="stretch" spacing={2}>
        <Button
          size="large"
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          sx={{
            border: '1px solid rgba(255, 255, 255, 1)',
            backgroundColor: 'transparent',
            borderRadius: '4px',
            color: 'white',
          }}
        >
          Cancel
        </Button>

        <LoadingButton
          fullWidth
          loading={confirming}
          size="large"
          variant="contained"
          onClick={onConfirm}
          sx={{ backgroundColor: 'rgba(243, 39, 88, 1)', borderRadius: '4px' }}
        >
          Confirm
        </LoadingButton>
      </Section>
    </Layout>
  );
};

PopupLayout.Section = Section;
