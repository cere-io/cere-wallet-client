import { observer } from 'mobx-react-lite';
import { Button, Container, Stack } from '@cere-wallet/ui';
import { useIdToken } from './useIdToken';
import { useEffect, useMemo } from 'react';
import { OpenLoginStore } from '~/stores';

const Login = () => {
  const openLoginStore = useMemo(() => new OpenLoginStore(), []);
  const { request, loading } = useIdToken({
    onReceive: (token) => openLoginStore.login(token),
  });

  useEffect(() => {
    openLoginStore.init();
  }, [openLoginStore]);

  return (
    <Container maxWidth="md">
      <Stack alignItems="center" paddingY={5}>
        <Button
          disabled={loading}
          variant="contained"
          color="primary"
          onClick={() => request({ email: '', password: '' })}
        >
          Login
        </Button>
      </Stack>
    </Container>
  );
};

export default observer(Login);
