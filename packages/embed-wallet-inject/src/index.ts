import { EmbedWallet, WalletConnectOptions } from '@cere/embed-wallet';

import { PolkadotInjector } from './polkadot';

type InjectTarget = 'polkadot';

export type EnableOptions = {
  name?: string;
  target?: InjectTarget;
  autoConnect?: boolean;
  connectOptions?: WalletConnectOptions;
};

export type InjectOptions = Omit<EnableOptions, 'target'> & {
  targets?: InjectTarget[];
};

/**
 * Enables the injected wallet and returns the injected application
 */
export const enable = async (wallet: EmbedWallet, { target = 'polkadot', ...options }: EnableOptions = {}) => {
  if (target !== 'polkadot') {
    throw new Error(`Unsupported target: ${target}`);
  }

  return new PolkadotInjector(wallet, options).enable();
};

/**
 * Injects the wallet into the global object (Window)
 */
export const inject = async (wallet: EmbedWallet, { targets = ['polkadot'], ...options }: InjectOptions = {}) => {
  if (targets.includes('polkadot')) {
    new PolkadotInjector(wallet, options).inject();
  }
};
