import { PropsWithChildren } from 'react';
import { styled, Button, CereIcon, Container, Typography } from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';
import { HeaderLink, HeaderLinkProps } from './HeaderLink';
import { Section } from './Section';

export type PopupLayoutProps = PropsWithChildren<{
  title?: string;
  network?: string;
  links?: HeaderLinkProps[];
  onConfirm: () => void;
  onCancel: () => void;
}>;

const Logo = styled(CereIcon)({
  fontSize: '40px',
});

const Layout = styled(Container)(({ theme }) => ({
  padding: theme.spacing(0, 3, 3),
}));

export const PopupLayout = ({
  title = 'Confirm transaction',
  network = '',
  links = [],
  children,
  onCancel,
  onConfirm,
}: PopupLayoutProps) => {
  return (
    <Layout maxWidth="sm">
      <Section spacing={3} alignItems="center">
        <Logo />
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <NetworkLabel label={network} />
      </Section>

      <Section>
        {links.map((linkProps) => (
          <HeaderLink key={linkProps.title} {...linkProps} />
        ))}
      </Section>

      {children}

      <Section direction="row" alignSelf="stretch" spacing={2}>
        <Button size="large" fullWidth variant="contained" onClick={onCancel}>
          Cancel
        </Button>

        <Button size="large" fullWidth variant="contained" color="primary" onClick={onConfirm}>
          Confirm
        </Button>
      </Section>
    </Layout>
  );
};

PopupLayout.Section = Section;
