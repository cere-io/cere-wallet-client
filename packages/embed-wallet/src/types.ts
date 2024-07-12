import type { NetworkInterface } from '@cere/torus-embed';
import BN from 'bn.js';

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
  appId?: string;
  name?: string;
  logoUrl?: string;
};

export type ContextWhiteLabel = Record<string, any>; // TODO: Use proper white label types

export type Context = {
  banner?: ContextBanner;
  app: ContextApp;
  whiteLabel?: ContextWhiteLabel;
};

export type PartialContext = Omit<Context, 'app'> & { app?: Partial<ContextApp> };

// User information

export type UserInfo = {
  email: string;
  name: string;
  profileImage: string;
  isNewUser: boolean;
};

export type WalletAccountType = 'ethereum' | 'ed25519' | 'solana';
export type WalletAccount = {
  address: string;
  type: WalletAccountType;
  name: string;
};

// Wallet options
export type WalletEvent = 'status-update' | 'accounts-update' | 'balance-update';
export type WalletScreen = 'home' | 'topup' | 'settings';
export type WalletEnvironment = 'local' | 'dev' | 'stage' | 'prod';
export type WalletStatus =
  | 'not-ready'
  | 'initializing'
  | 'ready'
  | 'connected'
  | 'connecting'
  | 'disconnecting'
  | 'errored';

export type NetworkConfig = Omit<NetworkInterface, 'host'> & {
  host: 'matic' | 'amoy' | string;
};

export type WalletConnectOptions = {
  idToken?: string;
  mode?: 'redirect' | 'popup' | 'modal';
  redirectUrl?: string;
  permissions?: PermissionRequest;
  loginHint?: string;
  email?: string;
};

export type TokenType = 'erc20' | 'native';

export type WalletOptions = {
  /**
   * Alias for `context.app.appId`
   */
  appId?: string;
  sessionNamespace?: string;
  clientVersion?: string;
  env?: WalletEnvironment;
};

export type BiconomyOptions = {
  apiKey: string;
  enable?: boolean;
  debug?: boolean;
};

export type WalletInitOptions = WalletOptions & {
  network?: NetworkConfig;
  context?: PartialContext;
  popupMode?: 'popup' | 'modal';
  connectOptions?: Partial<WalletConnectOptions>;
  biconomy?: BiconomyOptions;
};

export type WalletTransferOptions = {
  token: 'CERE';
  type: TokenType;
  from?: string;
  to: string;
  amount: BN | number | string;
};

export type WalletShowOptions = {
  target?: string;
  params?: Record<string, string>;
  onClose?: () => void;
};

export type WalletSetContextOptions = {
  key?: string;
};

export type ProviderEvent<T = any> = {
  type: string;
  data: T;
};

export type WalletBalance = {
  token: 'CERE';
  type: TokenType;
  balance: BN;
  amount: BN;
  decimals: BN;
};

// Wallet Permissions System

export type PermissionCaveat = {
  type: string;
  value: any;
};

export type Permission = {
  parentCapability: string;
  caveats: PermissionCaveat[];
};

export type PermissionRequest = {
  [methodName: Permission['parentCapability']]: {
    [caveatName: PermissionCaveat['type']]: PermissionCaveat['value'];
  };
};

export type PermissionRevokeRequest = PermissionRequest;

export type RequestedPermission = {
  parentCapability: string;
  date?: number;
};
