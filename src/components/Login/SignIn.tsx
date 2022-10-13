import { Address, Button, CereIcon, IconButton, Divider, Stack, styled } from '@cere-wallet/ui';
import { useState } from 'react';
import { InfoStepper, LoginByEmail, Otp } from './components';
import { AuthApiService } from '~/api/auth-api.service';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

const Container = styled(Stack)({
  alignItems: 'stretch',
  padding: '16px',
});

interface LogInProps {
  variant?: 'signin' | 'signup';
}

enum PageEnum {
  STEPPER_PAGE,
  LOG_IN_PAGE,
  OTP_PAGE,
  TOKEN_PAGE, // technical page
}

const CereLogo = styled(CereIcon)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(48),
}));

export const SignIn = ({ variant = 'signin' }: LogInProps) => {
  const [activePage, setActivePage] = useState<PageEnum>(PageEnum.STEPPER_PAGE);
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string | null>(null); // technical page

  const handleBack = async () => {
    if (activePage > 0) {
      setActivePage(activePage - 1);
    }
  };

  const handleNewWallet = async () => {
    setActivePage(PageEnum.LOG_IN_PAGE);
  };

  const handleSendOtp = async (email: string) => {
    if (await AuthApiService.sendOtp(email)) {
      setEmail(email);
      setActivePage(PageEnum.OTP_PAGE);
    } else {
      console.error('Otp sending error');
    }
  };

  const handleVerify = async (code: string) => {
    const token = await AuthApiService.getToken(email, code);
    if (token) {
      setToken(token);
      setActivePage(PageEnum.TOKEN_PAGE);
    } else {
      console.error('Otp sending error');
    }
  };

  return (
    <Container>
      {activePage === PageEnum.STEPPER_PAGE && (
        <Stack alignItems="center" spacing="5px">
          <CereLogo />
          <InfoStepper />
          <Divider />
          <Button variant="contained" size="large" onClick={handleNewWallet}>
            Create a new wallet
          </Button>
          <Button variant="outlined" size="large" onClick={handleNewWallet}>
            I already have a wallet
          </Button>
        </Stack>
      )}
      {activePage === PageEnum.LOG_IN_PAGE && (
        <>
          <Stack direction="row" justifyContent="flex-start">
            <IconButton onClick={handleBack}>
              <ChevronLeftIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Stack>
          <LoginByEmail onSubmit={handleSendOtp} variant={variant} />
        </>
      )}
      {activePage === PageEnum.OTP_PAGE && (
        <>
          <Stack direction="row" justifyContent="flex-start">
            <IconButton onClick={handleBack}>
              <ChevronLeftIcon sx={{ fontSize: 36 }} />
            </IconButton>
          </Stack>
          <Otp email={email} onVerify={handleVerify} onResend={() => handleSendOtp(email)} />
        </>
      )}
      {activePage === PageEnum.TOKEN_PAGE && ( // technical page
        <>
          your token:
          <Address showCopy address={token || ''} size={'small'} maxLength={24} />
        </>
      )}
    </Container>
  );
};
