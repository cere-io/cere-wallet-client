import { ConsoleLike } from '@toruslabs/openlogin-jrpc';
import { ChainConfig } from '@cere-wallet/wallet-engine';

import { DEFAULT_NETWORK } from '../constants';
import { createMux } from '../createMux';
import { getChainConfig } from '../getChainConfig';
import {
  createChannels,
  InitChannelIn,
  PrivateKeyLoginChannelIn,
  UserInfo,
  LoginChannelIn,
  StatusChannelOut,
  AppContextChannelIn,
  WalletChannelOut,
  WindowChannelIn,
} from './channels';

type WindowOptions = Pick<WindowChannelIn['data'], 'popupMode' | 'preopenInstanceId'>;

export type WalletConnection = {
  toggleFullscreen: (isFull: boolean) => boolean;
  setLoggedInStatus: (status: StatusChannelOut) => boolean;
  closeWindow: (instanceId: string) => boolean;
  createWindow: (instanceId: string, url?: string) => boolean;
  redirect: (url: string) => boolean;
};

type InitData = Omit<InitChannelIn['data'], 'network'> & {
  chainConfig: ChainConfig;
};

export type WalletConnectionOptions = {
  logger?: ConsoleLike;
  onInit: (data: InitData) => Promise<boolean>;
  onLogin: (data: LoginChannelIn['data']) => Promise<string>;
  onLoginWithPrivateKey: (data: PrivateKeyLoginChannelIn['data']) => Promise<boolean>;
  onRehydrate: (params: Pick<InitData, 'sessionId'>) => Promise<UserInfo | undefined>;
  onLogout: () => Promise<boolean>;
  onUserInfoRequest: () => Promise<UserInfo | undefined>;
  onWindowOpen: (data: WindowOptions) => Promise<void>;
  onWindowClose: (data: WindowOptions) => Promise<void>;
  onWalletOpen: () => Promise<WalletChannelOut['data']>;
  onAppContextUpdate: (context: AppContextChannelIn['data']) => Promise<void>;
  onChangeWidgetVisibility: (isVisible: boolean) => Promise<void> | void;
};

export const createWalletConnection = ({
  logger,
  onInit,
  onRehydrate,
  onLoginWithPrivateKey,
  onLogin,
  onLogout,
  onUserInfoRequest,
  onWindowClose,
  onWindowOpen,
  onWalletOpen,
  onAppContextUpdate,
  onChangeWidgetVisibility,
}: WalletConnectionOptions): WalletConnection => {
  const mux = createMux('iframe_comm', 'embed_comm').setMaxListeners(50);
  const channels = createChannels({ mux, logger });

  // Handle init requests

  channels.init.subscribe(async ({ name, data }) => {
    if (name !== 'init_stream') {
      return;
    }

    const { network = DEFAULT_NETWORK, ...restData } = data;
    const success = await onInit({
      ...restData,
      chainConfig: getChainConfig(network),
    });

    const userInfo = await onRehydrate({ sessionId: data.sessionId });

    if (userInfo) {
      channels.status.publish({
        verifier: userInfo.verifier,
        loggedIn: true,
        rehydrate: true,
      });
    }

    channels.init.publish({
      name: 'init_complete',
      data: { success },
    });
  });

  // Handle login with private key requests

  channels.login.subscribe(async ({ name, data }) => {
    if (name !== 'login_with_private_key_request') {
      return;
    }

    const success = await onLoginWithPrivateKey(data);

    channels.status.publish({
      loggedIn: success,
      rehydrate: false,
      verifier: data.userInfo.verifier,
    });

    channels.login.publish({
      name: 'login_with_private_key_response',
      data: { success },
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
      onWindowClose(data);
    } else if (name === 'opened_window') {
      onWindowOpen(data);
    }
  });

  // Handle wallet open requests

  channels.wallet.subscribe(async ({ name }) => {
    if (name !== 'show_wallet') {
      return;
    }

    const data = await onWalletOpen();

    channels.wallet.publish({
      data,
      name: 'show_wallet_instance',
    });
  });

  // Handle wallet context requests

  channels.appContext.subscribe(async ({ name, data }) => {
    if (name !== 'set_context') {
      return;
    }

    onAppContextUpdate(data);
  });

  // Handle auth requests

  channels.auth.subscribe(async ({ name, data }) => {
    if (name !== 'oauth') {
      return;
    }

    try {
      const selectedAddress = await onLogin(data);

      channels.auth.publish({ selectedAddress });
    } catch (error) {
      if (error instanceof Error) {
        channels.auth.publish({ err: error.message });
      }
    }
  });

  channels.widgetVisibilty.subscribe(({ data }) => {
    onChangeWidgetVisibility(data);
  });

  return {
    toggleFullscreen: (isFull) => channels.widget.publish({ name: 'widget', data: isFull }),
    setLoggedInStatus: (status) => channels.status.publish(status),

    redirect: (url: string) =>
      channels.window.publish({
        name: 'redirect',
        data: { url },
      }),

    closeWindow: (instanceId) =>
      channels.window.publish({
        preopenInstanceId: instanceId,
        close: true,
      }),

    createWindow: (preopenInstanceId, url) =>
      channels.window.publish({
        name: 'create_window',
        data: { preopenInstanceId, url },
      }),
  };
};
