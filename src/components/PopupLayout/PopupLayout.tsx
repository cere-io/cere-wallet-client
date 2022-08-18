import { PropsWithChildren } from 'react';
import { styled, Button, CereIcon, Container, Stack, Typography } from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';
import { HeaderLink, HeaderLinkProps } from './HeaderLink';

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

const Section = styled(Stack)(({ theme }) => ({
  marginTop: theme.spacing(4),
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
    <Container maxWidth="sm">
      <Section spacing={3} alignItems="center">
        <Logo />
        <Typography variant="h5" fontWeight="bold">
          {title}
        </Typography>
        <NetworkLabel label={network} />
      </Section>

      <Section>
        {links.map((linkProps) => (
          <HeaderLink {...linkProps} />
        ))}
      </Section>

      {children}

      <Section direction="row" alignSelf="stretch" spacing={2}>
        <Button size="large" fullWidth variant="contained" color="inherit" onClick={onCancel}>
          Cancel
        </Button>

        <Button size="large" fullWidth variant="contained" onClick={onConfirm}>
          Confirm
        </Button>
      </Section>
    </Container>
  );
};

PopupLayout.Section = Section;
