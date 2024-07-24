import type { TORUS_NETWORK_TYPE } from '@toruslabs/constants';

import npmPackage from '../package.json';

export const APP_VERSION = npmPackage.version;
export const APP_SIMULATION = process.env.REACT_APP_SIMULATION;
export const APP_ENV = process.env.REACT_APP_ENV;
export const WALLET_HELP_URL = process.env.REACT_APP_HELP_URL || 'https://cere.network/cere-wallet-faq/';
export const OPEN_LOGIN_CLIENT_ID = process.env.REACT_APP_TORUS_AUTH_ID || '';
export const OPEN_LOGIN_NETWORK = (process.env.REACT_APP_TORUS_AUTH_NETWORK || 'mainnet') as TORUS_NETWORK_TYPE;
export const OPEN_LOGIN_VERIFIER = process.env.REACT_APP_TORUS_AUTH_VERIFIER || 'cere-wallet';
export const WALLET_API = process.env.REACT_APP_WALLET_API;
export const REACT_APP_FREEPORT_API = process.env.REACT_APP_FREEPORT_API;
export const REACT_APP_DDC_API = process.env.REACT_APP_DDC_API;
export const REACT_APP_RAMP_API_KEY = process.env.REACT_APP_RAMP_API_KEY;
export const CERE_NETWORK_RPC = process.env.REACT_APP_CERE_NETWORK_RPC || '';
export const GTM_ID = process.env.REACT_APP_GMT_ID;
export const DEFAULT_APP_ID = process.env.REACT_DEFAULT_APP_ID || 'cere-wallet';
export const BICONOMY_API_KEY = process.env.REACT_APP_BICONOMY_API_KEY || undefined;
export const SENTRY_DNS = process.env.REACT_APP_SENTRY_DNS;

export const ANALYTICS = {
  createWalletBtnClass: 'create-wallet-btn',
  existingWalletBtnClass: 'existing-wallet-btn',
};

export const FEATURE_FLAGS = {
  transferAssets: process.env.REACT_APP_TRANSFER_ASSETS_FEATURE === 'true',
  assetsManagement: process.env.REACT_APP_ASSETS_MANAGEMENT_FEATURE === 'true',
};

/**
 * TODO: Turn it back when fixed for mobiles
 */
export const SUPPORTED_SOCIAL_LOGINS: ('google' | 'facebook')[] = [];

export const COIN_TICKER_ALIAS: Record<string, string> = {
  CERE_ERC20: 'CERE',
};

export const RPC_POLLING_INTERVAL = 10000;
export const AUTH_SESSION_TIMEOUT = 604800;
export const AUTH_TOKEN_ISSUER = 'cere-wallet';

export const ALLOWED_WALLET_PERMISSIONS = [
  'personal_sign',
  'ed25519_signRaw',
  'solana_signMessage',
  'ed25519_signPayload', // TODO: Dangerous permission, try to narrow its scope in future
] as const;
