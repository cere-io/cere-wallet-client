import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ConfirmPopupStore } from '~/stores';
import { ConfirmPopupLayout, RawData } from '~/components';
import { Divider, Link, Stack, Typography } from '@cere-wallet/ui';

const ConfirmPopup = () => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId');
  const store = useMemo(() => new ConfirmPopupStore(instanceId!), [instanceId]);

  return (
    <ConfirmPopupLayout
      title="Confirm transaction"
      network={store.network?.displayName}
      onCancel={store.decline}
      onConfirm={store.approve}
    >
      <Stack spacing={3} marginBottom={2}>
        <Stack spacing={1}>
          <Typography variant="body2" fontWeight="bold">
            Requested from
          </Typography>
          <Link href={store.app.url}>{store.app.label}</Link>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="body2" fontWeight="bold">
            Data
          </Typography>
          <RawData hex={store.content} json={store.content} />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="body2" color="textSecondary">
            Network Fee
          </Typography>

          <Typography variant="body2" fontWeight="bold">
            0 USDC
          </Typography>
        </Stack>
      </Stack>

      <Divider flexItem />
    </ConfirmPopupLayout>
  );
};

export default observer(ConfirmPopup);
