import { observer } from 'mobx-react-lite';

import { TransactionPopupStore } from '~/stores';
import { usePopupStore } from '~/hooks';
import TransactionResult from './TransactionResult';
import TransactionRequest from './TransactionRequest';
import { Box } from '@cere-wallet/ui';

const TransactionPopup = () => {
  const store = usePopupStore((popupId, isLocal) => new TransactionPopupStore(popupId, isLocal));

  return (
    <Box marginX={2} marginBottom={2}>
      {store.step === 'details' ? <TransactionResult store={store} /> : <TransactionRequest store={store} />}
    </Box>
  );
};

export default observer(TransactionPopup);
