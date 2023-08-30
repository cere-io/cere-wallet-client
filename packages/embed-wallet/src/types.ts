import type { NetworkInterface } from '@cere/torus-embed';
import BN from 'bn.js';

// White label styles

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

export type BorderStyle =
  | 'dotted'
  | 'dashed'
  | 'solid'
  | 'double'
  | 'groove'
  | 'ridge'
  | 'inset'
  | 'outset'
  | 'none'
  | 'hidden';

export type Color = RGB | RGBA | HEX;

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
  whiteLabel?: ContextWhiteLabel;
};

export type ContextWhiteLabel = {
  backgroundImage?: string;
  backgroundColor?: Color;
  palette?: {
    primary?: {
      main: Color;
      light: Color;
    };
    secondary?: {
      main: Color;
      light: Color;
    };
    text?: {
      primary: Color;
      secondary: Color;
      caption: Color;
    };
    divider?: Color;
  };
  button?: {
    contained?: {
      backgroundColor: Color;
      borderRadius: number | `${string}px`;
    };
    outlined?: {
      backgroundColor: Color | 'transparent';
      borderRadius: number | `${string}px`;
      border: `${number}px ${BorderStyle} ${Color}`;
    };
    text?: {
      color: Color;
    };
  };
  textField?: {
    enabled: {
      input: Color;
      '& fieldset': {
        border: string;
      };
    };
    disabled: {
      '& .MuiInputBase-input.Mui-disabled': {
        WebkitTextFillColor: Color;
      };
    };
  };
};

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

export type WalletAccount = {
  address: string;
  type: 'ethereum' | 'ed25519';
  name: string;
};

// Wallet options
export type WalletEvent = 'status-update' | 'accounts-update' | 'balance-update';
export type WalletStatus = 'not-ready' | 'ready' | 'connected' | 'connecting' | 'disconnecting' | 'errored';
export type WalletScreen = 'home' | 'topup' | 'settings';
export type WalletEnvironment = 'local' | 'dev' | 'stage' | 'prod';

export type NetworkConfig = Omit<NetworkInterface, 'host'> & {
  host: 'matic' | 'mumbai' | string;
};

export type WalletConnectOptions = {
  idToken?: string;
  mode?: 'redirect' | 'popup' | 'modal';
  redirectUrl?: string;
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

export type WalletInitOptions = WalletOptions & {
  network?: NetworkConfig;
  context?: PartialContext;
  popupMode?: 'popup' | 'modal';
  connectOptions?: Partial<WalletConnectOptions>;
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
