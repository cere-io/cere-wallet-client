import { Stack, useIsMobile } from '@cere-wallet/ui';
import { useNavigate } from 'react-router-dom';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { LoginPage } from '~/components';

export const LoginRoute = ({ variant = 'signin' }: { variant?: 'signin' | 'signup' }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  if (isMobile) {
    return (
      <Stack
        direction="column"
        justifyContent="flex-start"
        alignItems="stretch"
        padding="16px"
        height="100vh"
        spacing="76px"
      >
        <ArrowBackIosIcon onClick={() => navigate(-1)} />
        <Stack direction="column" textAlign="justify">
          <LoginPage variant={variant} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="column" justifyContent="flex-start" alignItems="stretch" padding="16px" height="100vh">
      <ArrowBackIosIcon onClick={() => navigate(-1)} />
      <Stack direction="row" justifyContent="center" alignItems="center" padding="16px" height="100vh">
        <Stack width="375px">
          <LoginPage variant={variant} />
        </Stack>
      </Stack>
    </Stack>
  );
};
