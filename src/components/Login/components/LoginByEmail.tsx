import { Button, Stack, Typography, TextField, CereIcon, useIsMobile } from '@cere-wallet/ui';
import { ChangeEvent, useState } from 'react';

interface LogInProps {
  variant?: 'signin' | 'signup';
  onSubmit?: (code: string) => void;
}

export const LoginByEmail = ({ variant = 'signin', onSubmit }: LogInProps) => {
  const isMobile = useIsMobile();
  const [email, setEmail] = useState<string>('');

  const handleSubmit = () => {
    if (typeof onSubmit === 'function') {
      onSubmit(email);
    }
  };

  return (
    <Stack direction="column" alignItems="center">
      <Stack direction="column" spacing="5px" alignItems="stretch" maxWidth={isMobile ? '100%' : '350px'}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" flex={1}>
            CERE wallet
          </Typography>
          <CereIcon />
        </Stack>
        <Typography variant="body16Regular" color="text.secondary">
          Send and receive any currency or simply top up with your card.
        </Typography>
        <TextField
          variant="outlined"
          onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        />
        <Typography variant="body16Regular" color="text.secondary">
          By using your Cere wallet you automatically agree to our <a href="#">Terms & Conditions</a> and{' '}
          <a href="#">Privacy Policy</a>
        </Typography>
        <Stack direction="column" alignItems="center">
          <Button variant="contained" size="large" onClick={handleSubmit}>
            Sign {variant === 'signin' ? 'In' : 'Up'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
