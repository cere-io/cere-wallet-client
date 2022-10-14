import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Loading, Logo } from '@cere-wallet/ui';

import { usePopupStore } from '~/hooks';
import { AuthorizePopupStore } from '~/stores';

const AuthorizeStart = () => {
  const store = usePopupStore((popupId) => new AuthorizePopupStore(popupId));

  useEffect(() => {
    store.start();
  }, [store]);

  return (
    <Loading fullScreen>
      <Logo />
    </Loading>
  );
};

export default observer(AuthorizeStart);
