import EventEmitter from 'events';

export declare type ChainConfig = {
  chainId: string;
  rpcTarget: string;
  displayName: string;
  blockExplorer: string;
  ticker: string;
  tickerName: string;
};

/**
 * TODO: Solana key type was added as a temparary solution.
 * Solana uses `ed25519` so it would be better to add another key property eg. `chainNamespace` instead of  extending`type`.
 *
 * For simplification, we can use `type` for now.
 */
export type KeyType = 'ethereum' | 'ed25519' | 'solana';
export type KeyPair = {
  type: KeyType;
  address: string;
  publicKey: Buffer;
  secretKey: Buffer;
};

export type Account = Omit<KeyPair, 'secretKey' | 'publicKey'> & {
  name: string;
};

export type ProviderRequestArguments = {
  readonly method: string;
  readonly params?: unknown[] | Record<string, unknown>;
};

/**
 * EIP-1193 compatible provider
 */
export interface Provider extends EventEmitter {
  request<T = any>({ method, params }: ProviderRequestArguments): Promise<T>;
}
