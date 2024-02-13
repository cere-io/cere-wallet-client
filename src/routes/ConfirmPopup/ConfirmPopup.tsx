import { observer } from 'mobx-react-lite';
import { InfoTable, Typography, Link, Stack } from '@cere-wallet/ui';

import { ConfirmPopupStore } from '~/stores';
import { PopupLayout, PriceRow, TransactionData } from '~/components';
import { usePopupStore } from '~/hooks';

const ConfirmPopup = () => {
  const store = usePopupStore((popupId, isLocal) => new ConfirmPopupStore(popupId, isLocal));

  return (
    <PopupLayout
      title="Signature Request"
      confirmLabel="Sign"
      cancelLabel="Reject"
      loading={!store.isReady}
      network={store.network}
      onCancel={store.decline}
      onConfirm={store.approve}
    >
      {store.app && (
        <PopupLayout.Section spacing={1}>
          <Typography variant="body1" fontWeight="medium">
            Requested from
          </Typography>
          <Link href={store.app.url}>{store.app.name}</Link>
        </PopupLayout.Section>
      )}

      {store.data && (
        <PopupLayout.Section>
          <Stack spacing={2}>
            <Typography variant="body1">Data:</Typography>
            <TransactionData {...store.data} />
          </Stack>
        </PopupLayout.Section>
      )}

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
