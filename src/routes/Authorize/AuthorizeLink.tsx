import { useEffect, useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, CancelIcon, Loading, Logo, Stack, Typography } from '@cere-wallet/ui';
import { AuthApiService } from '~/api/auth-api.service';

type LinkState = [string, string, string, string];

const parseState = (state: string | null): LinkState | undefined => {
  try {
    return state && JSON.parse(atob(state));
  } catch (e) {
    return undefined;
  }
};

const AuthorizeLink = () => {
  const [validationError, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [query] = useSearchParams();
  const encodedState = query.get('state');
  const state = useMemo(() => parseState(encodedState), [encodedState]);
  const [email, linkCode, otp, appName] = state || [];
  const error = !state || validationError;

  useEffect(() => {
    if (!email || !linkCode || !otp) {
      return;
    }

    AuthApiService.validateLink(email, linkCode, otp).then((success) => {
      return success ? setSuccess(true) : setError(true);
    });
  }, [email, linkCode, otp]);

  if (!error && !success) {
    return (
      <Loading fullScreen>
        <Logo />
      </Loading>
    );
  }

  const Icon = success ? CheckCircleIcon : CancelIcon;
  const title = success ? 'Login Success!' : 'Login Error!';
  const message = success
    ? `You can now close this window and continue using the ${appName || 'Cere Wallet'}.`
    : 'The login link is invalid or expired. Please try again.';

  return (
    <Stack component={Typography} height="100vh" spacing={2} justifyContent="center" alignItems="center">
      <Icon color={error ? 'error' : 'success'} sx={{ fontSize: 60 }} />
      <Typography color="text.primary" variant="h3" noWrap>
        {title}
      </Typography>
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
};

export default observer(AuthorizeLink);
