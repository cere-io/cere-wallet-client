import { ConsoleLike } from '@toruslabs/openlogin-jrpc';
import { ChainConfig } from '@cere-wallet/wallet-engine';

import { createMux } from '../createMux';
import { createChannels, InitChannelIn, LoginChannelIn, UserInfo, AppContextChannelIn } from './channels';

type WindowOptions = {
  instanceId: string;
};

export type WalletConnection = {
  toggleFullscreen: (isFull: boolean) => void;
  closeWindow: (instanceId: string) => boolean;
};

type InitData = Omit<InitChannelIn['data'], 'network'> & {
  chainConfig: ChainConfig;
};

export type WalletConnectionOptions = {
  logger?: ConsoleLike;
  onInit: (data: InitData) => Promise<boolean>;
  onLogin: (data: LoginChannelIn['data']) => Promise<boolean>;
  onRehydrate: () => Promise<boolean>;
  onLogout: () => Promise<boolean>;
  onUserInfoRequest: () => Promise<UserInfo | undefined>;
  onWindowOpen: (data: WindowOptions) => Promise<void>;
  onWindowClose: (data: WindowOptions) => Promise<void>;
  onWalletOpen: () => Promise<string>;
  onAppContextUpdate: (context: AppContextChannelIn['data']) => Promise<void>;
};

export const createWalletConnection = ({
  logger,
  onInit,
  onRehydrate,
  onLogin,
  onLogout,
  onUserInfoRequest,
  onWindowClose,
  onWindowOpen,
  onWalletOpen,
  onAppContextUpdate,
}: WalletConnectionOptions): WalletConnection => {
  const mux = createMux('iframe_comm', 'embed_comm').setMaxListeners(50);
  const channels = createChannels({ mux, logger });

  // Handle init requests

  channels.init.subscribe(async ({ name, data }) => {
    if (name !== 'init_stream') {
      return;
    }

    const { network, ...restData } = data;
    const success = await onInit({
      ...restData,
      chainConfig: {
        chainNamespace: 'eip155',
        chainId: `0x${network.chainId.toString(16)}`,
        rpcTarget: network.host,
        displayName: network.networkName,
        blockExplorer: network.blockExplorer,
        ticker: network.ticker,
        tickerName: network.tickerName,
      },
    });

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

  // Handle wallet context requests

  channels.appContext.subscribe(async ({ name, data }) => {
    if (name !== 'set_context') {
      return;
    }

    onAppContextUpdate(data);
  });

  return {
    toggleFullscreen: (isFull) => channels.widget.publish({ name: 'widget', data: isFull }),
    closeWindow: (instanceId) => channels.window.publish({ preopenInstanceId: instanceId, close: true }),
  };
};
