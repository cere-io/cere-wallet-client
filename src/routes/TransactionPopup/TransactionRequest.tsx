import { observer } from 'mobx-react-lite';
import { InfoTable, Stack, Truncate, Typography, useTheme } from '@cere-wallet/ui';

import { TransactionPopupStore } from '~/stores';
import { PopupLayout, TransactionData, PriceRow } from '~/components';

export type TransactionRequestProps = {
  store: TransactionPopupStore;
};

const TransactionRequest = ({ store }: TransactionRequestProps) => {
  const { isGame } = useTheme();
  return (
    <PopupLayout
      title={isGame ? 'Confirm Transfer' : 'Confirm transaction'}
      loading={!store.isReady}
      confirming={store.status === 'approved'}
      network={store.network}
      onCancel={store.decline}
      onConfirm={store.approve}
      links={[
        { title: 'App:', label: store.app?.name, url: store.app?.url },
        {
          title: 'From:',
          label: <Truncate maxLength={35} variant="hex" text={store.from.label} />,
          url: store.from.url,
        },
        { title: 'To:', label: <Truncate maxLength={35} variant="hex" text={store.to.label} />, url: store.to.url },
      ]}
    >
      {store.spending && (
        <PopupLayout.Section>
          <InfoTable>
            {store.spending.transfer && <PriceRow label="Amount" price={store.spending.transfer} />}
            {store.spending.price && (
              <PriceRow label={isGame ? 'Currency' : 'Purchase cost'} price={store.spending.price} />
            )}
            {store.spending.fee && <PriceRow label="Network fee" price={store.spending.fee} />}
            {store.spending.total && <PriceRow label="Total cost" price={store.spending.total} />}
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

export default observer(TransactionRequest);
