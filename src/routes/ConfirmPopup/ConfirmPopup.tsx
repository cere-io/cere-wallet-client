import { observer } from 'mobx-react-lite';
import { InfoTable, Typography, Link } from '@cere-wallet/ui';

import { ConfirmPopupStore } from '~/stores';
import { PopupLayout, PriceRow, TransactionData } from '~/components';
import { usePopupStore } from '~/hooks';

const ConfirmPopup = () => {
  const store = usePopupStore((popupId) => new ConfirmPopupStore(popupId));

  return (
    <PopupLayout
      title="Confirm transaction"
      loading={!store.isReady}
      network={store.network?.displayName}
      onCancel={store.decline}
      onConfirm={store.approve}
    >
      <PopupLayout.Section spacing={1}>
        <Typography variant="body2" fontWeight="bold">
          Requested from
        </Typography>
        <Link href={store.app.url}>{store.app.label}</Link>
      </PopupLayout.Section>

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
