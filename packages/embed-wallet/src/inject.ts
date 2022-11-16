import { EmbedWallet } from './EmbedWallet';
import { PolkadotInjector } from './polkadot';

type InjectTarget = 'polkadot';

export type InjectOptions = {
  targets?: InjectTarget[];
  autoConnect?: boolean;
};

/**
 * Injects the wallet into the global object (Window)
 */
export const inject = async (
  wallet: EmbedWallet,
  { targets = ['polkadot'], autoConnect = false }: InjectOptions = {},
) => {
  if (targets.includes('polkadot')) {
    new PolkadotInjector(wallet, { autoConnect }).inject();
  }
};
