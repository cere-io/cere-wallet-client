import { EmbedWallet, PermissionRequest } from '@cere/embed-wallet';

import { PolkadotInjector } from './polkadot';

type InjectTarget = 'polkadot';

export type InjectOptions = {
  name?: string;
  targets?: InjectTarget[];
  autoConnect?: boolean;
  permissions?: PermissionRequest;
};

/**
 * Injects the wallet into the global object (Window)
 */
export const inject = async (wallet: EmbedWallet, { targets = ['polkadot'], ...options }: InjectOptions = {}) => {
  if (targets.includes('polkadot')) {
    new PolkadotInjector(wallet, options).inject();
  }
};
