import { StrictMode, useMemo, useRef } from 'react';
import { UIProvider } from '@cere-wallet/ui';
import { createConnection } from '@cere-wallet/communication';

import { Router } from './routes';

export const App = () => {
  const stateRef = useRef<any>({});

  /**
   * Wallet connection placeholder - just for demonstration. Will be replaced with real implementation later
   */
  const connection = useMemo(
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

        onWindowClose: async ({ instanceId }) => {
          console.log('onWindowClose', instanceId);
        },

        onWindowOpen: async ({ instanceId }) => {
          console.log('onWindowOpen', instanceId);
        },
      }),
    [],
  );

  /**
   * Connection method to close opened popup window
   */
  console.log('`closeWindow` method', connection.closeWindow);

  /**
   * Proxy web3 provider JSON RPC duplex stream
   */
  console.log('`rpcStream` method', connection.rpcStream);

  return (
    <StrictMode>
      <UIProvider>
        <Router />
      </UIProvider>
    </StrictMode>
  );
};
