import { Stack, useIsMobile } from '@cere-wallet/ui';
import { useNavigate, useOutletContext } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { LoginPage } from '~/components';
import { AuthorizePopupStore } from '~/stores';

export const LoginRoute = ({ variant = 'signin', isGame }: { variant?: 'signin' | 'signup'; isGame?: boolean }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const store = useOutletContext<AuthorizePopupStore>();

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
        {isGame ? null : <ArrowBackIosIcon onClick={() => navigate(-1)} />}
        <Stack direction="column" textAlign="justify">
          <LoginPage isGame={isGame} variant={variant} onRequestLogin={(idToken) => store.login(idToken)} />
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
          <LoginPage isGame={isGame} variant={variant} onRequestLogin={(idToken) => store.login(idToken)} />
        </Stack>
      </Stack>
    </Stack>
  );
};
