import EventEmitter from 'events';
export type { CustomChainConfig as ChainConfig } from '@web3auth/base';

export type KeyType = 'ethereum' | 'ed25519';

export type KeyPair = {
  type: KeyType;
  address: string;
  publicKey: Buffer;
  secretKey: Buffer;
};

export type Account = Omit<KeyPair, 'secretKey' | 'publicKey'>;

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
