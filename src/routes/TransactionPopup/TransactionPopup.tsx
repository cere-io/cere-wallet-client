import { observer } from 'mobx-react-lite';
import { InfoTable, Stack, Typography } from '@cere-wallet/ui';

import { TransactionPopupStore } from '~/stores';
import { PopupLayout, TransactionData, PriceRow } from '~/components';
import { usePopupStore } from '~/hooks';

const TransactionPopup = () => {
  const store = usePopupStore((popupId) => new TransactionPopupStore(popupId));

  return (
    <PopupLayout
      title="Confirm transaction"
      loading={!store.isReady}
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
        <PopupLayout.Section collapsible>
          <InfoTable dense marginTop={1}>
            <InfoTable.Row label="Network" value={store.network?.displayName || ''} />
            {store.action && <InfoTable.Row label="Action" value={store.action} />}
          </InfoTable>

          <Stack spacing={2}>
            <Typography variant="body1" color="text.secondary" fontWeight="medium">
              Data:
            </Typography>
            <TransactionData {...store.data} />
          </Stack>
        </PopupLayout.Section>
      )}

      {store.toConfirm && (
        <PopupLayout.Section>
          <Typography variant="body1" color="text.secondary" fontWeight="regular">
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
