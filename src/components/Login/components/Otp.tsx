import { Button, Stack, Typography, TextField, CereIcon, useIsMobile, OtpInput } from '@cere-wallet/ui';
import { useState } from 'react';

interface OtpProps {
  email: string;
  onVerify?: (code: string) => void;
  onResend?: () => void;
}

export const Otp = ({ email, onVerify, onResend }: OtpProps) => {
  const isMobile = useIsMobile();
  const [code, setCode] = useState<string>('');

  const handleVerify = () => {
    if (typeof onVerify === 'function') {
      onVerify(code);
    }
  };

  const handleResend = () => {
    if (typeof onResend === 'function') {
      onResend();
    }
  };

  return (
    <Stack direction="column" alignItems="center">
      <Stack direction="column" spacing="5px" alignItems="stretch" maxWidth={isMobile ? '100%' : '350px'}>
        <Stack direction="row" alignItems="center">
          <Typography variant="h4" flex={1}>
            Verify email
          </Typography>
          <CereIcon />
        </Stack>
        <Typography variant="body16Regular" color="text.secondary">
          Access CERE using code sent to your email
        </Typography>
        <TextField value={email} variant="outlined" disabled={true} />
        <Typography variant="body16Regular" color="text.secondary">
          Verification code
        </Typography>
        <OtpInput onChange={setCode} />
        <Stack direction="column" alignItems="center">
          <Button variant="contained" size="large" onClick={handleVerify}>
            Verify
          </Button>
        </Stack>
        <Typography variant="body16Regular" align="center">
          Did not receive a code?{' '}
          <Button variant="text" onClick={handleResend}>
            Resend code
          </Button>
        </Typography>
      </Stack>
    </Stack>
  );
};
