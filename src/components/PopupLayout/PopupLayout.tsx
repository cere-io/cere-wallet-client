import { PropsWithChildren } from 'react';
import { styled, Button, Logo, Container, Typography, Loading } from '@cere-wallet/ui';

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
  padding: theme.spacing(0, 3, 3),
}));

export const PopupLayout = ({
  title = 'Confirm transaction',
  loading = false,
  network,
  links,
  children,
  onCancel,
  onConfirm,
}: PopupLayoutProps) => (
  <Layout maxWidth="sm">
    <Section spacing={3} alignItems="center">
      <Logo size="large" />
      <Typography variant="h5" fontWeight="bold">
        {title}
      </Typography>
      {network && !loading && <NetworkLabel label={network} />}
    </Section>

    {loading ? (
      <Loading fullScreen>
        <Logo />
      </Loading>
    ) : (
      <>
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
      </>
    )}
  </Layout>
);

PopupLayout.Section = Section;
