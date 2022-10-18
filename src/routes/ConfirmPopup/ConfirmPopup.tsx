import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { ConfirmPopupStore } from '~/stores';
import { PopupLayout, PriceRow, TransactionData } from '~/components';
import { InfoTable, Typography, Link } from '@cere-wallet/ui';

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
      <PopupLayout.Section spacing={1}>
        <Typography variant="body1" fontWeight="medium">
          Requested from
        </Typography>
        <Link href={store.app.url}>{store.app.label}</Link>
      </PopupLayout.Section>

      <PopupLayout.Section spacing={1}>
        <Typography variant="body1" fontWeight="medium">
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
