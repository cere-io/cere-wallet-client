import { ConsoleLike, ObjectMultiplex } from '@toruslabs/openlogin-jrpc';

import { createChannels, InitData, LoginData, UserInfo } from './channels';

type WindowOptions = {
  instanceId: string;
};

export type WalletConnection = {
  closeWindow: (instanceId: string) => boolean;
};

export type WalletConnectionOptions = {
  logger?: ConsoleLike;
  onInit: (data: InitData) => Promise<boolean>;
  onLogin: (data: LoginData) => Promise<boolean>;
  onRehydrate: () => Promise<boolean>;
  onLogout: () => Promise<boolean>;
  onUserInfoRequest: () => Promise<UserInfo | undefined>;
  onWindowOpen: (data: WindowOptions) => Promise<void>;
  onWindowClose: (data: WindowOptions) => Promise<void>;
};

export const createWalletConnection = (
  mux: ObjectMultiplex,
  {
    logger,
    onInit,
    onRehydrate,
    onLogin,
    onLogout,
    onUserInfoRequest,
    onWindowClose,
    onWindowOpen,
  }: WalletConnectionOptions,
): WalletConnection => {
  const channels = createChannels({ mux, logger });

  // Handle init requests

  channels.init.subscribe(async ({ name, data }) => {
    if (name !== 'init_stream') {
      return;
    }

    const success = await onInit(data);
    const rehydrated = await onRehydrate();
    const userInfo = rehydrated && (await onUserInfoRequest());

    channels.init.publish({
      name: 'init_complete',
      data: { success },
    });

    if (userInfo) {
      channels.status.publish({
        loggedIn: true,
        rehydrate: true,
        verifier: userInfo.verifier,
      });
    }
  });

  // Handle login with private key requests

  channels.login.subscribe(async ({ name, data }) => {
    if (name !== 'login_with_private_key_request') {
      return;
    }

    const success = await onLogin(data);

    channels.login.publish({
      name: 'login_with_private_key_response',
      data: { success },
    });

    channels.status.publish({
      loggedIn: success,
      rehydrate: false,
      verifier: data.userInfo.verifier,
    });
  });

  // Handle logout requests

  channels.logout.subscribe(async ({ name }) => {
    if (name !== 'logOut') {
      return;
    }

    const success = await onLogout();

    channels.status.publish({ loggedIn: !success });
  });

  // Handle user info requests

  channels.userInfo.subscribe(async ({ name }) => {
    if (name !== 'user_info_access_request') {
      return;
    }

    const userInfo = await onUserInfoRequest();

    channels.userInfo.publish({
      name: 'user_info_access_response',
      data: {
        approved: !!userInfo,
        payload: userInfo,
      },
    });
  });

  // Handle window requests

  channels.window.subscribe(({ name, data }) => {
    if (data.closed) {
      onWindowClose({ instanceId: data.preopenInstanceId });
    } else if (name === 'opened_window') {
      onWindowOpen({ instanceId: data.preopenInstanceId });
    }
  });

  return {
    closeWindow: (instanceId) => channels.window.publish({ preopenInstanceId: instanceId, close: true }),
  };
};
