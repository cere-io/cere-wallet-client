import { PropsWithChildren, useMemo } from 'react';
import { styled, Button, Logo, Container, Typography, Loading, useIsMobile } from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';
import { HeaderLink, HeaderLinkProps } from './HeaderLink';
import { Section } from './Section';

export type PopupLayoutProps = PropsWithChildren<{
  title?: string;
  network?: string;
  links?: HeaderLinkProps[];
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>;

const Layout = styled(Container)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
}));

export const PopupLayout = ({
  title = 'Confirm transaction',
  loading = false,
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
        <Logo size="large" />
        <Typography variant={isMobile ? 'h4' : 'h3'}>{title}</Typography>
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
        <Button size="large" fullWidth variant="contained" color="inherit" onClick={onCancel}>
          Cancel
        </Button>

        <Button size="large" fullWidth variant="contained" onClick={onConfirm}>
          Confirm
        </Button>
      </Section>
    </Layout>
  );
};

PopupLayout.Section = Section;
