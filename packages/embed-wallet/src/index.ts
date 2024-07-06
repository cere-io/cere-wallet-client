export { default as BN } from 'bn.js';
export { preloadIframe as prefetchWalletIframe } from '@cere/torus-embed';

export * from './EmbedWallet';
export * from './types';
export { WALLET_CLIENT_VERSION } from './constants';

export type { SignerOptions } from './Signer';
export type { ProviderInterface, SignerInterface } from './Provider';
