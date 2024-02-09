import { observer } from 'mobx-react-lite';
import { Stack, useIsMobile, useTheme } from '@cere-wallet/ui';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { OtpPage } from '~/components';

import { AuthorizePopupStore } from '~/stores';

const OtpRoute = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();
  const store = useOutletContext<AuthorizePopupStore>();
  const { isGame } = useTheme();

  store.email = location.state?.email;

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
          <OtpPage email={store.email} onRequestLogin={(idToken) => store.login(idToken)} />
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
          <OtpPage email={store.email} onRequestLogin={(idToken) => store.login(idToken)} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default observer(OtpRoute);
