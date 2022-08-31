import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ConfirmPopupStore } from '~/stores';
import { PopupLayout, PriceRow, TransactionData } from '~/components';
import { InfoTable, Stack, Typography, Link } from '@cere-wallet/ui';

const ConfirmPopup = () => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId');
  const store = useMemo(() => new ConfirmPopupStore(instanceId!), [instanceId]);

  return (
    <PopupLayout
      title="Confirm transaction"
      loading={!store.isReady}
      network={store.network?.displayName}
      onCancel={store.decline}
      onConfirm={store.approve}
    >
      <Stack spacing={1}>
        <Typography variant="body2" fontWeight="bold">
          Requested from
        </Typography>
        <Link href={store.app.url}>{store.app.label}</Link>
      </Stack>

      <PopupLayout.Section spacing={1}>
        <Typography variant="body2" fontWeight="bold">
          Data:
        </Typography>
        <TransactionData hex={store.content} />
      </PopupLayout.Section>

      {store.fee && (
        <PopupLayout.Section spacing={1}>
          <InfoTable>
            <PriceRow label="Network Fee" price={store.fee} />
          </InfoTable>
        </PopupLayout.Section>
      )}
    </PopupLayout>
  );
};

export default observer(ConfirmPopup);
