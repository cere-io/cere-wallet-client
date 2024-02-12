import { Stack, useIsMobile, useTheme } from '@cere-wallet/ui';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { LoginPage } from '~/components';
import { AuthorizePopupStore } from '~/stores';
import { useAppContextStore } from '~/hooks';

export const LoginRoute = ({ variant = 'signin' }: { variant?: 'signin' | 'signup' }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const store = useOutletContext<AuthorizePopupStore>();
  const { isGame } = useTheme();
  const appStore = useAppContextStore();

  const skipLoginIntro = Boolean(appStore.whiteLabel?.skipLoginIntro);

  if (isMobile) {
    return (
      <Stack
        direction="column"
        justifyContent={isGame ? 'center' : 'flex-start'}
        alignItems="stretch"
        padding={2}
        height="100vh"
        spacing={9}
      >
        {isGame || Boolean(skipLoginIntro) ? null : <ArrowBackIosIcon onClick={() => navigate(-1)} />}
        <Stack direction="column" textAlign="justify">
          <LoginPage variant={variant} onRequestLogin={(idToken) => store.login(idToken)} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      direction="column"
      justifyContent={isGame ? 'center' : 'flex-start'}
      alignItems="stretch"
      padding={2}
      height="100vh"
    >
      {isGame ? null : <ArrowBackIosIcon onClick={() => navigate(-1)} />}
      <Stack direction="row" justifyContent="center" alignItems="center" padding={2} height="100vh">
        <Stack width={375}>
          <LoginPage variant={variant} onRequestLogin={(idToken) => store.login(idToken)} />
        </Stack>
      </Stack>
    </Stack>
  );
};
