import { ObjectMultiplex as Mux } from '@toruslabs/openlogin-jrpc';
import { createChannel } from './createChannel';

export type NetworkConfig = {
  blockExplorer: string;
  chainId: number;
  host: string;
  networkName: string;
  ticker: string;
  tickerName: string;
};

export type UserInfo = {
  email: string;
  name: string;
  profileImage: string;
  typeOfLogin: string;
  verifier: string;
  verifierId: string;
};

export type InitData = {
  network: NetworkConfig;
  torusWidgetVisibility: boolean;
};

type InitChannelIn = {
  name: 'init_stream';
  data: InitData;
};

type InitChannelOut = {
  name: 'init_complete';
  data: {
    success: boolean;
  };
};

export type LoginData = {
  privateKey: string;
  userInfo: UserInfo;
};

type LoginChannelIn = {
  name: 'login_with_private_key_request';
  data: LoginData;
};

type LoginChannelOut = {
  name: 'login_with_private_key_response';
  data: {
    success: boolean;
  };
};

type LogoutChannelInOut = {
  name: 'logOut';
};

type StatusChannelIn = unknown;
type StatusChannelOut = {
  loggedIn: boolean;
  rehydrate?: boolean;
  verifier?: string;
};

type UserInfoChannelIn = {
  name: 'user_info_access_request';
};

type UserInfoChannelOut = {
  name: 'user_info_access_response';
  data: {
    approved: boolean;
    payload?: UserInfo;
  };
};

type WindowChannelIn = {
  name?: 'opened_window';
  data: {
    preopenInstanceId: string;
    closed?: boolean;
  };
};

type WindowChannelOut = {
  preopenInstanceId: string;
  close: boolean;
};

type WidgetVisibilityChannel = {
  data: boolean;
};

export const createChannels = (mux: Mux) => ({
  init: createChannel<InitChannelIn, InitChannelOut>(mux, 'init_stream'),
  login: createChannel<LoginChannelIn, LoginChannelOut>(mux, 'login_with_private_key'),
  logout: createChannel<LogoutChannelInOut, LogoutChannelInOut>(mux, 'logout'),
  status: createChannel<StatusChannelIn, StatusChannelOut>(mux, 'status'),
  userInfo: createChannel<UserInfoChannelIn, UserInfoChannelOut>(mux, 'user_info_access'),
  window: createChannel<WindowChannelIn, WindowChannelOut>(mux, 'window'),
  widgetVisibilty: createChannel<WidgetVisibilityChannel, WidgetVisibilityChannel>(mux, 'torus-widget-visibility'),
});
