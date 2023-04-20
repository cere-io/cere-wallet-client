import { Stack, useIsMobile } from '@cere-wallet/ui';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { OtpPage } from '~/components';

import { AuthorizePopupStore } from '~/stores';

export const OtpRoute = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const store = useOutletContext<AuthorizePopupStore>();

  const email = location.state?.email;

  if (isMobile) {
    return (
      <Stack direction="column" justifyContent="flex-start" alignItems="stretch" padding={2} height="100vh" spacing={9}>
        <ArrowBackIosIcon onClick={() => navigate(-1)} />
        <Stack direction="column" textAlign="justify">
          <OtpPage email={email} onRequestLogin={(idToken) => store.login(idToken)} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="column" justifyContent="flex-start" alignItems="stretch" padding={2} height="100vh">
      <ArrowBackIosIcon onClick={() => navigate(-1)} />
      <Stack direction="row" justifyContent="center" alignItems="center" padding={2} height="100vh">
        <Stack width={375}>
          <OtpPage email={email} onRequestLogin={(idToken) => store.login(idToken)} />
        </Stack>
      </Stack>
    </Stack>
  );
};
