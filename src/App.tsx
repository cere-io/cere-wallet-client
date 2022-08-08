import { StrictMode, useMemo, useRef } from 'react';
import { UIProvider } from '@cere-wallet/ui';
import { createConnection } from '@cere-wallet/communication';

import { Router } from './routes';

export const App = () => {
  const stateRef = useRef<any>({});
  useMemo(
    () =>
      createConnection({
        logger: console,
        onInit: async (data) => {
          console.log('onInit', data);

          return true;
        },
        onLogin: async (data) => {
          console.log('onLogin', data);
          stateRef.current.userInfo = data.userInfo;
          return true;
        },
        onLogout: async () => {
          return true;
        },
        onRehydrate: async () => {
          console.log('onRehydrate');
          return false;
        },
        onUserInfoRequest: async () => {
          console.log('onUserInfoRequest');
          return stateRef.current.userInfo;
        },

        onWindowClose: async () => {},
        onWindowOpen: async () => {},
      }),
    [],
  );

  return (
    <StrictMode>
      <UIProvider>
        <Router />
      </UIProvider>
    </StrictMode>
  );
};
