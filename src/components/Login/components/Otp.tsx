import { Button, Stack, Typography, TextField, CereIcon, useIsMobile, styled, OtpInput } from '@cere-wallet/ui';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';

const Container = styled(Stack)({
  alignItems: 'center',
  padding: '16px',
});

interface OtpProps {
  email: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
}

export const Otp = ({ email, onVerify, onResend }: OtpProps) => {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [code, setCode] = useState<string>('');

  const handleVerify = () => {
    if (onVerify && typeof onVerify === 'function') {
      onVerify(code);
    }
  };

  const handleResend = () => {
    if (onResend && typeof onResend === 'function') {
      onResend();
    }
  };

  console.log('location', location);
  console.log('code', code);

  return (
    <Container>
      <Stack spacing={1} width={isMobile ? '100%' : '400px'}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" flex={1}>
            Verify email
          </Typography>
          <CereIcon />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Access CERE using code sent to your email
        </Typography>
        <TextField value={email} variant="outlined" disabled={true} />
        <Typography variant="body2" color="text.secondary">
          Verification code
        </Typography>
        <OtpInput onChange={setCode} />
        <Button variant="contained" onClick={handleVerify}>
          Verify
        </Button>
        <Typography variant="body2" align="center">
          Did not receive a code?{' '}
          <Button variant="text" onClick={handleResend}>
            Resend code
          </Button>
        </Typography>
      </Stack>
    </Container>
  );
};
