import { createChannel, CreateChannelOptions } from './createChannel';

export type UserInfo = {
  email: string;
  name: string;
  profileImage: string;
  typeOfLogin: string;
  verifier: string;
  verifierId: string;
};

export type NetworkInterface = {
  host: 'matic' | 'mumbai' | string;
  chainId?: number;
  networkName?: string;
  blockExplorer?: string;
  ticker?: string;
  tickerName?: string;
};

export type LoginData = {
  preopenInstanceId: string;
  calledFromEmbed: boolean;
  verifier: string;
  login_hint: string;
  loginOptions: {
    mode?: 'redirect' | 'popup';
    idToken?: string;
    redirectUrl?: string;
  };
};

export type InitChannelIn = {
  name: 'init_stream';
  data: {
    torusWidgetVisibility: boolean;
    network: NetworkInterface;
  };
};

export type InitChannelOut = {
  name: 'init_complete';
  data: {
    success: boolean;
  };
};

export type PrivateKeyLoginChannelIn = {
  name: 'login_with_private_key_request';
  data: {
    privateKey: string;
    userInfo: UserInfo;
  };
};

export type PrivateKeyLoginChannelOut = {
  name: 'login_with_private_key_response';
  data: {
    success: boolean;
  };
};

export type LogoutChannelInOut = {
  name: 'logOut';
};

export type StatusChannelIn = unknown;
export type StatusChannelOut = {
  loggedIn: boolean;
  rehydrate?: boolean;
  verifier?: string;
};

export type UserInfoChannelIn = {
  name: 'user_info_access_request';
};

export type UserInfoChannelOut = {
  name: 'user_info_access_response';
  data: {
    approved: boolean;
    payload?: UserInfo;
  };
};

export type WindowChannelIn = {
  name?: 'opened_window';
  data: {
    preopenInstanceId: string;
    closed?: boolean;
  };
};

export type WindowChannelOut =
  | {
      preopenInstanceId: string;
      close: boolean;
    }
  | {
      name: 'create_window';
      data: {
        preopenInstanceId: string;
        url?: string;
      };
    }
  | {
      name: 'redirect';
      data: {
        url: string;
      };
    };

export type WidgetVisibilityChannel = {
  data: boolean;
};

export type WalletChannelIn = {
  name: 'show_wallet';
};

export type WalletChannelOut = {
  name: 'show_wallet_instance';
  data: {
    instanceId: string;
  };
};

export type WidgetChannelIn = unknown;
export type WidgetChannelOut = {
  name: 'widget';
  data: boolean;
};

export type LoginChannelIn = {
  name: 'oauth';
  data: LoginData;
};

export type LoginChannelOut = {
  err?: string;
  selectedAddress?: string;
};

export const createChannels = (options: CreateChannelOptions) => ({
  init: createChannel<InitChannelIn, InitChannelOut>('init_stream', options),
  login: createChannel<PrivateKeyLoginChannelIn, PrivateKeyLoginChannelOut>('login_with_private_key', options),
  logout: createChannel<LogoutChannelInOut, LogoutChannelInOut>('logout', options),
  status: createChannel<StatusChannelIn, StatusChannelOut>('status', options),
  userInfo: createChannel<UserInfoChannelIn, UserInfoChannelOut>('user_info_access', options),
  window: createChannel<WindowChannelIn, WindowChannelOut>('window', options),
  widgetVisibilty: createChannel<WidgetVisibilityChannel, WidgetVisibilityChannel>('torus-widget-visibility', options),
  wallet: createChannel<WalletChannelIn, WalletChannelOut>('show_wallet', options),
  widget: createChannel<WidgetChannelIn, WidgetChannelOut>('widget', options),
  auth: createChannel<LoginChannelIn, LoginChannelOut>('oauth', options),
});
