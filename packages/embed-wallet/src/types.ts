import type { NetworkInterface } from '@cere/torus-embed';

// App context

type ContextBannerText = {
  variant: 'primary' | 'secondary';
  text: string;
  color?: string;
};

export type ContextBanner = {
  content: [ContextBannerText, ContextBannerText?];
  thumbnailUrl?: string;
  badgeUrl?: string;
  right?: [ContextBannerText, ContextBannerText?];
  hasBackButton?: boolean;
};

export type ContextApp = {
  url: string;
  name?: string;
  logoUrl?: string;
};

export type Context = {
  banner?: ContextBanner;
  app?: ContextApp;
};

// User information

export type UserInfo = {
  email: string;
  name: string;
  profileImage: string;
  idToken: string;
};

// Wallet options
export type WalletEvent = 'status-update';
export type WalletStatus = 'not-ready' | 'ready' | 'connected' | 'connecting' | 'disconnecting' | 'errored';
export type WalletScreen = 'home' | 'topup' | 'settings';
export type WalletEnvironment = 'local' | 'dev' | 'stage' | 'prod';

export type NetworkConfig = Omit<NetworkInterface, 'host'> & {
  host: 'matic' | 'mumbai' | string;
};

export type WalletInitOptions = {
  env?: WalletEnvironment;
  network?: NetworkConfig;
  context?: Context;
};

export type WalletConnectOptions = {
  idToken?: string;
  mode?: 'redirect' | 'popup';
  redirectUrl?: string;
};

export type WalletShowOptions = {
  target?: string;
  params?: Record<string, string>;
  onClose?: () => void;
};

export type WalletSetContextOptions = {
  key?: string;
};
