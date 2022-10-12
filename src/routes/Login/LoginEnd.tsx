import { observer } from 'mobx-react-lite';
import { Container, Stack, Typography } from '@cere-wallet/ui';
import { useEffect, useMemo } from 'react';
import { OpenLoginStore } from '~/stores';

const LoginEnd = () => {
  const openLoginStore = useMemo(() => new OpenLoginStore(), []);

  useEffect(() => {
    openLoginStore.init();
  }, [openLoginStore]);

  return (
    <Container maxWidth="md">
      <Stack alignItems="center" paddingY={5}>
        <Typography variant="h5">Login End</Typography>
      </Stack>
    </Container>
  );
};

export default observer(LoginEnd);
