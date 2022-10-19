import { Button, CereIcon, Divider, Stack, styled } from '@cere-wallet/ui';
import { InfoStepper } from './components';
import { useLocation, useNavigate } from 'react-router-dom';

const CereLogo = styled(CereIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(48),
}));

export const IntroPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Stack direction="column" alignItems="stretch" spacing={1}>
      <Stack direction="column" alignItems="center" spacing={1}>
        <CereLogo />
      </Stack>
      <InfoStepper />
      <Divider />
      <Button variant="contained" size="large" onClick={() => navigate('/authorize/signup' + location.search)}>
        Create a new wallet
      </Button>
      <Button variant="outlined" size="large" onClick={() => navigate('/authorize/signin' + location.search)}>
        I already have a wallet
      </Button>
    </Stack>
  );
};
