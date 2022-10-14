import { Stack, useIsMobile } from '@cere-wallet/ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { OtpPage } from '~/components';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

export const OtpRoute = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

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
          <OtpPage email={email} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="column" justifyContent="flex-start" alignItems="stretch" padding="16px" height="100vh">
      <ArrowBackIosIcon onClick={() => navigate(-1)} />
      <Stack direction="row" justifyContent="center" alignItems="center" padding="16px" height="100vh">
        <Stack width="375px">
          <OtpPage email={email} />
        </Stack>
      </Stack>
    </Stack>
  );
};
