import { Button, CereIcon, Divider, Stack, styled } from '@cere-wallet/ui';
import { InfoStepper } from './components';
import { useNavigate } from 'react-router-dom';

const CereLogo = styled(CereIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(48),
}));

export const IntroPage = () => {
  const navigate = useNavigate();

  return (
    <Stack direction="column" alignItems="stretch" spacing="5px">
      <Stack direction="column" alignItems="center" spacing="5px">
        <CereLogo />
      </Stack>
      <InfoStepper />
      <Divider />
      <Button variant="contained" size="large" onClick={() => navigate('/login/signup')}>
        Create a new wallet
      </Button>
      <Button variant="outlined" size="large" onClick={() => navigate('/login/signin')}>
        I already have a wallet
      </Button>
    </Stack>
  );
};
