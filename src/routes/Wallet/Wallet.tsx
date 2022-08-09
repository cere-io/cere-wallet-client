import { observer } from 'mobx-react-lite';
import { useEffect, useMemo } from 'react';
import { Button, Stack } from '@cere-wallet/ui';

import { Hello } from '~/components';
import { createWalletStore } from '~/stores';

const Wallet = () => {
  const store = useMemo(createWalletStore, []);

  useEffect(() => {
    store.start();

    return () => store.stop();
  }, [store]);

  return (
    <Stack spacing={2} marginTop={4} alignItems="center">
      <Hello store={store} />

      <Button variant="contained" onClick={store.reset}>
        Reset
      </Button>

      <Button variant="contained" onClick={store.stop}>
        Stop
      </Button>

      <Button variant="contained" onClick={store.start}>
        Start
      </Button>
    </Stack>
  );
};

export default observer(Wallet);
