import { BackIcon, IconButton, Stack, styled } from '@cere-wallet/ui';
import { useState } from 'react';
import { LoginByEmail } from './components';
import { Otp } from './components';
import { AuthApiService } from '~/api/auth-api.service';

const Container = styled(Stack)({
  alignItems: 'center',
  padding: '16px',
});

interface LogInProps {
  variant?: 'signin' | 'signup';
  onTokenReady?: (idToken: string) => void;
}

enum PageEnum {
  WIZARD_PAGE,
  LOG_IN,
  OTP_PAGE,
}

export const SignIn = ({ variant = 'signin', onTokenReady }: LogInProps) => {
  const [activePage, setActivePage] = useState<PageEnum>(PageEnum.LOG_IN);
  const [email, setEmail] = useState<string>('');

  const handleBack = async () => {
    if (activePage > 1) {
      setActivePage(activePage - 1);
    }
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
      onTokenReady?.(token);
    } else {
      console.error('Otp sending error');
    }
  };

  return (
    <Container>
      <IconButton onClick={handleBack}>
        <BackIcon />
      </IconButton>
      {activePage === PageEnum.LOG_IN && (
        <>
          <LoginByEmail onSubmit={handleSendOtp} variant={variant} />
        </>
      )}
      {activePage === PageEnum.OTP_PAGE && (
        <>
          <Otp email={email} onVerify={handleVerify} onResend={() => handleSendOtp(email)} />
        </>
      )}
    </Container>
  );
};