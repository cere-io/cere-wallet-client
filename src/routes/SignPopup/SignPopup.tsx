import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Stack, Paper, Button } from '@cere-wallet/ui';

import { SignPopupStore } from '~/stores';

const SignPopup = () => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId');
  const store = useMemo(() => new SignPopupStore(instanceId!), [instanceId]);

  return (
    <Stack spacing={4} width={600} marginX="auto" marginTop={8}>
      <Paper sx={{ padding: 2 }}>Network: {store.network?.displayName}</Paper>

      <Paper sx={{ padding: 2 }}>
        <pre>{JSON.stringify(store.content)}</pre>
      </Paper>

      <Stack direction="row" justifyContent="space-between">
        <Button variant="contained" onClick={store.approve}>
          Approve
        </Button>

        <Button variant="contained" color="warning" onClick={store.decline}>
          Decline
        </Button>
      </Stack>
    </Stack>
  );
};

export default observer(SignPopup);
