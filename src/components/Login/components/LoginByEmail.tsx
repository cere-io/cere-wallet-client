import { Button, Stack, Typography, TextField, CereIcon, useIsMobile, styled } from '@cere-wallet/ui';
import { useState } from 'react';

const Container = styled(Stack)({
  alignItems: 'center',
  padding: '16px',
});

interface LogInProps {
  variant?: 'signin' | 'signup';
  onSubmit?: (code: string) => void;
}

export const LoginByEmail = ({ variant = 'signin', onSubmit }: LogInProps) => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState<string>('');

  const handleSubmit = () => {
    if (onSubmit && typeof onSubmit === 'function') {
      onSubmit(email);
    }
  };

  return (
    <Container>
      <Stack spacing={1} width={isMobile ? '100%' : '400px'}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" flex={1}>
            CERE wallet
          </Typography>
          <CereIcon />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Send and receive any currency or simply top up with your card.
        </Typography>
        <TextField variant="outlined" onChange={(event) => setEmail(event.target.value)} />
        <Typography variant="body2" color="text.secondary">
          By using your Cere wallet you automatically agree to our <a href="#">Terms & Conditions</a> and{' '}
          <a href="#">Privacy Policy</a>
        </Typography>
        <Button variant="contained" onClick={handleSubmit}>
          Sign {variant === 'signin' ? 'In' : 'Up'}
        </Button>
      </Stack>
    </Container>
  );
};
