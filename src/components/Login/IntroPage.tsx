import { Button, CereIcon, Divider, Stack, styled } from '@cere-wallet/ui';
import { InfoStepper } from './components';
import { useLocation, useNavigate } from 'react-router-dom';
import { ANALYTICS } from '~/constants';

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

      <Stack direction="column" alignItems="stretch" spacing={1} paddingTop={2}>
        <Button
          variant="contained"
          size="large"
          className={ANALYTICS.createWalletBtnClass}
          onClick={() => navigate({ ...location, pathname: '/authorize/signup' })}
        >
          Create a new wallet
        </Button>
        <Button
          variant="outlined"
          size="large"
          className={ANALYTICS.existingWalletBtnClass}
          onClick={() => navigate({ ...location, pathname: '/authorize/signin' })}
        >
          I already have a wallet
        </Button>
      </Stack>
    </Stack>
  );
};
