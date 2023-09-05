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
  CereColorIcon,
  useWhiteLabel,
} from '@cere-wallet/ui';

import { NetworkLabel } from '../NetworkLabel';
import { HeaderLink, HeaderLinkProps } from './HeaderLink';
import { Section } from './Section';

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
  padding: theme.whiteLabel ? theme.spacing(0, 4, 3, 4) : theme.spacing(0, 0, 3, 0), // TODO ask
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
  const { textColor, isGame, brandColor, borderRadius } = useWhiteLabel();

  return loading ? (
    <Loading fullScreen>
      <Logo />
    </Loading>
  ) : (
    <Layout disableGutters maxWidth="sm">
      <Section spacing={3} alignItems="center">
        {isGame ? <CereColorIcon /> : <Logo size="large" />}
        <Typography variant={isMobile ? 'h4' : 'h3'} color={textColor}>
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
          variant="contained"
          color="inherit"
          onClick={onCancel}
          sx={{ backgroundColor: brandColor ?? '', borderRadius: borderRadius ?? '' }}
        >
          Cancel
        </Button>

        <LoadingButton
          sx={{ backgroundColor: brandColor ?? '', borderRadius: borderRadius ?? '' }}
          fullWidth
          loading={confirming}
          size="large"
          variant="contained"
          onClick={onConfirm}
        >
          Confirm
        </LoadingButton>
      </Section>
    </Layout>
  );
};

PopupLayout.Section = Section;
