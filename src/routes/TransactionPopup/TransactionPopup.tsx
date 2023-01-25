import { observer } from 'mobx-react-lite';

import { TransactionPopupStore } from '~/stores';
import { usePopupStore } from '~/hooks';
import TransactionResult from './TransactionResult';
import TransactionRequest from './TransactionRequest';

const TransactionPopup = () => {
  const store = usePopupStore((popupId, isLocal) => new TransactionPopupStore(popupId, isLocal));

  return store.step === 'details' ? <TransactionResult store={store} /> : <TransactionRequest store={store} />;
};

export default observer(TransactionPopup);
