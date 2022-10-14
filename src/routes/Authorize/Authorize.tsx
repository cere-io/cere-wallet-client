import { observer } from 'mobx-react-lite';
import { Button, Container, Stack } from '@cere-wallet/ui';
import { useIdToken } from './useIdToken';

const createNextUrl = (idToken?: string) => {
  const url = new URL(window.location.href);
  const nextUrl = new URL(url.searchParams.get('redirect_uri')!);
  const nextParams = new URLSearchParams(url.search);

  if (idToken) {
    nextParams.set('id_token', idToken);
  }

  nextUrl.hash = nextParams.toString();

  return nextUrl.toString();
};

const Authorize = () => {
  const { request, loading } = useIdToken({
    onReceive: (token) => {
      window.location.replace(createNextUrl(token));
    },
  });

  return (
    <Container maxWidth="md">
      <Stack alignItems="center" paddingY={5}>
        <Button disabled={loading} variant="contained" color="primary" onClick={request}>
          Login
        </Button>
      </Stack>
    </Container>
  );
};

export default observer(Authorize);
