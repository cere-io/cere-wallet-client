import { PropsWithChildren, useMemo } from 'react';
import {
  styled,
  Button,
  Logo,
  Container,
  Typography,
  Loading,
  useIsMobile,
  LoadingButton,
  CereWhiteIcon,
  useTheme,
} from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';
import { HeaderLink, HeaderLinkProps } from './HeaderLink';
import { Section } from './Section';

type Network = {
  displayName: string;
  icon?: string;
};

export type PopupLayoutProps = PropsWithChildren<{
  title?: string;
  network?: Network;
  links?: HeaderLinkProps[];
  loading?: boolean;
  confirming?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}>;

const Layout = styled(Container)(({ theme }) => ({
  padding: theme.isGame ? theme.spacing(0, 4, 3, 4) : theme.spacing(0, 0, 3, 0),
}));

export const PopupLayout = ({
  title = 'Confirm transaction',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
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
  const { isGame } = useTheme();

  return loading ? (
    <Loading fullScreen>
      <Logo />
    </Loading>
  ) : (
    <Layout disableGutters maxWidth="sm">
      <Section spacing={3} alignItems="center">
        {isGame ? <CereWhiteIcon /> : <Logo size="large" />}
        <Typography variant={isMobile ? 'h4' : 'h3'} color={isGame ? 'primary.light' : 'text.primary'}>
          {title}
        </Typography>
        {network && !loading && <NetworkLabel label={network.displayName} icon={network.icon} />}
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
          variant="contained"
          color="inherit"
          onClick={onCancel}
          sx={
            isGame
              ? {
                  border: '1px solid rgba(255, 255, 255, 1)',
                  backgroundColor: 'transparent',
                  borderRadius: '4px',
                  color: 'white',
                  ':hover': {
                    backgroundColor: 'transparent',
                  },
                }
              : null
          }
        >
          {cancelLabel}
        </Button>

        <LoadingButton fullWidth loading={confirming} size="large" variant="contained" onClick={onConfirm}>
          {confirmLabel}
        </LoadingButton>
      </Section>
    </Layout>
  );
};

PopupLayout.Section = Section;
