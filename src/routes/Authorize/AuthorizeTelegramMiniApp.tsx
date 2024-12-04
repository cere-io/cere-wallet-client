import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';

import { useOutletContext } from 'react-router-dom';

import { AuthorizePopupStore } from '~/stores';
import { useAppContextStore } from '~/hooks';
import { AuthApiService } from '~/api/auth-api.service';

const AuthorizeTelegramMiniApp = () => {
  const authStore = useOutletContext<AuthorizePopupStore>();
  const appContext = useAppContextStore();

  useEffect(() => {
    if (!appContext.authMethod) {
      throw new Error('telegram-mini-app requires authMethod to be passed');
    }

    const [botId, initData] = appContext.authMethod.token.split(':');
    AuthApiService.getTokenByTelegramMiniAppInitData(botId, initData).then((idToken) => {
      authStore.login(idToken!!).then(() => {
        authStore.acceptSession();
      });
    });
  }, [authStore, appContext]);

  return <div></div>;
};

export default observer(AuthorizeTelegramMiniApp);
