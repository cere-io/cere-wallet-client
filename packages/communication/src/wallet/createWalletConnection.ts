import { ConsoleLike } from '@toruslabs/openlogin-jrpc';
import { ChainConfig } from '@cere-wallet/wallet-engine';

import { createMux } from '../createMux';
import { getChainConfig } from './getChainConfig';
import {
  createChannels,
  InitChannelIn,
  PrivateKeyLoginChannelIn,
  UserInfo,
  LoginChannelIn,
  NetworkInterface,
  StatusChannelOut,
} from './channels';

type WindowOptions = {
  instanceId: string;
};

export type WalletConnection = {
  toggleFullscreen: (isFull: boolean) => void;
  closeWindow: (instanceId: string) => boolean;
  setLoggedInStatus: (status: StatusChannelOut) => void;
};

type InitData = Omit<InitChannelIn['data'], 'network'> & {
  chainConfig: ChainConfig;
};

export type WalletConnectionOptions = {
  logger?: ConsoleLike;
  onInit: (data: InitData) => Promise<boolean>;
  onLogin: (data: LoginChannelIn['data']) => Promise<string>;
  onLoginWithPrivateKey: (data: PrivateKeyLoginChannelIn['data']) => Promise<boolean>;
  onRehydrate: () => Promise<boolean>;
  onLogout: () => Promise<boolean>;
  onUserInfoRequest: () => Promise<UserInfo | undefined>;
  onWindowOpen: (data: WindowOptions) => Promise<void>;
  onWindowClose: (data: WindowOptions) => Promise<void>;
  onWalletOpen: () => Promise<string>;
};

const defaultNetwork: NetworkInterface = {
  host: process.env.REACT_APP_DEFAULT_RPC || 'matic',
  chainId: process.env.REACT_APP_DEFAULT_CHAIN_ID ? Number(process.env.REACT_APP_DEFAULT_CHAIN_ID) : undefined,
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
}: WalletConnectionOptions): WalletConnection => {
  const mux = createMux('iframe_comm', 'embed_comm').setMaxListeners(50);
  const channels = createChannels({ mux, logger });

  // Handle init requests

  channels.init.subscribe(async ({ name, data }) => {
    if (name !== 'init_stream') {
      return;
    }

    const { network = defaultNetwork, ...restData } = data;
    const success = await onInit({
      ...restData,
      chainConfig: getChainConfig(network),
    });

    const rehydrated = await onRehydrate();
    const userInfo = rehydrated && (await onUserInfoRequest());

    if (userInfo) {
      channels.status.publish({
        loggedIn: true,
        rehydrate: true,
        verifier: userInfo.verifier,
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
      onWindowClose({ instanceId: data.preopenInstanceId });
    } else if (name === 'opened_window') {
      onWindowOpen({ instanceId: data.preopenInstanceId });
    }
  });

  // Handle wallet open requests

  channels.wallet.subscribe(async ({ name }) => {
    if (name !== 'show_wallet') {
      return;
    }

    const instanceId = await onWalletOpen();

    channels.wallet.publish({
      name: 'show_wallet_instance',
      data: { instanceId },
    });
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

  return {
    toggleFullscreen: (isFull) => channels.widget.publish({ name: 'widget', data: isFull }),
    closeWindow: (instanceId) => channels.window.publish({ preopenInstanceId: instanceId, close: true }),
    setLoggedInStatus: (status) => channels.status.publish(status),
  };
};
