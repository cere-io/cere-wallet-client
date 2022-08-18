import { observer } from 'mobx-react-lite';
import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InfoTable, Typography } from '@cere-wallet/ui';

import { TransactionPopupStore } from '~/stores';
import { PopupLayout, TransactionData, PriceRow } from '~/components';

const TransactionPopup = () => {
  const [params] = useSearchParams();
  const instanceId = params.get('instanceId');
  const store = useMemo(() => new TransactionPopupStore(instanceId!), [instanceId]);

  return (
    <PopupLayout
      title="Confirm transaction"
      network={store.network?.displayName}
      onCancel={store.decline}
      onConfirm={store.approve}
      links={[
        { title: 'App:', label: store.app.label, url: store.app.url },
        { title: 'From:', label: store.from.label, url: store.from.url },
        { title: 'To:', label: store.to.label, url: store.to.url },
      ]}
    >
      {store.spending && (
        <PopupLayout.Section>
          <InfoTable>
            <PriceRow label="Purchase cost" price={store.spending.price} />
            <PriceRow label="Network fee" price={store.spending.fee} />
            <PriceRow label="Total cost" price={store.spending.total} />
          </InfoTable>
        </PopupLayout.Section>
      )}

      {store.data && (
        <PopupLayout.Section spacing={1}>
          <Typography variant="body2" fontWeight="bold">
            Data
          </Typography>
          <TransactionData {...store.data} />
        </PopupLayout.Section>
      )}

      {store.toConfirm && (
        <PopupLayout.Section>
          <Typography variant="body2" color="text.secondary">
            By confirming this transaction you allow this contract to spend up to
            <b>{` ${store.toConfirm.amount} ${store.toConfirm.symbol} `}</b>
            of your token balance
          </Typography>
        </PopupLayout.Section>
      )}
    </PopupLayout>
  );
};

export default observer(TransactionPopup);