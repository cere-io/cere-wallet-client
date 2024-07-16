// import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useSearchParams } from 'react-router-dom';
import { Alert, Loading, Logo, Typography } from '@cere-wallet/ui';
import { useEffect, useMemo, useState } from 'react';

type LinkState = [string, string, string];

const parseState = (state: string | null): LinkState | undefined => {
  try {
    return state && JSON.parse(atob(state));
  } catch (e) {
    return undefined;
  }
};

const AuthorizeLink = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);
  const [query] = useSearchParams();
  const encodedState = query.get('state');
  const state = useMemo(() => parseState(encodedState), [encodedState]);

  useEffect(() => {
    if (!state) {
      return setError('The link is invalid. Please try again.');
    }

    const [email, linkCode, otp] = state;

    setSuccess(true);
  }, [state]);

  let content = <Logo />;

  if (error) {
    content = (
      <Alert severity="warning" variant="outlined">
        <Typography noWrap>{error}</Typography>
      </Alert>
    );
  }

  if (success) {
    content = (
      <Alert severity="success" variant="outlined">
        <Typography noWrap>Link has been successfully processed.</Typography>
      </Alert>
    );
  }

  return (
    <Loading fullScreen hideSpinner={!!error || success}>
      {content}
    </Loading>
  );
};

export default observer(AuthorizeLink);
