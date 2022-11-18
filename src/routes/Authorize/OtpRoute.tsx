import { useLocation, useNavigate } from 'react-router-dom';
import { Stack, useIsMobile } from '@cere-wallet/ui';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { OtpPage } from '~/components';

export const OtpRoute = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  if (isMobile) {
    return (
      <Stack direction="column" justifyContent="flex-start" alignItems="stretch" padding={2} height="100vh" spacing={9}>
        <ArrowBackIosIcon onClick={() => navigate(-1)} />
        <Stack direction="column" textAlign="justify">
          <OtpPage email={email} />
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack direction="column" justifyContent="flex-start" alignItems="stretch" padding={2} height="100vh">
      <ArrowBackIosIcon onClick={() => navigate(-1)} />
      <Stack direction="row" justifyContent="center" alignItems="center" padding={2} height="100vh">
        <Stack width={375}>
          <OtpPage email={email} />
        </Stack>
      </Stack>
    </Stack>
  );
};
