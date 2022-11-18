import { observer } from 'mobx-react-lite';
import { InfoTable, Link, Typography } from '@cere-wallet/ui';
import { PopupLayout, PriceRow, TransactionData } from '~/components';
import { usePopupStore } from '~/hooks';
import { ConfirmPopupStore } from '~/stores';

const ConfirmPopup = () => {
  const store = usePopupStore((popupId, isLocal) => new ConfirmPopupStore(popupId, isLocal));

  return (
    <PopupLayout
      title="Confirm transaction"
      loading={!store.isReady}
      network={store.network?.displayName}
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
