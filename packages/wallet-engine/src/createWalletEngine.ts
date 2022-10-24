import { JRPCEngine, JRPCMiddleware } from '@toruslabs/openlogin-jrpc';
import { ethersProviderAsMiddleware } from 'eth-json-rpc-middleware';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

import {
  createWalletMiddleware,
  createProviderMiddleware,
  WalletMiddlewareOptions,
  ProviderMiddlewareOptions,
} from './middleware';

export type WalletEngineOptions = WalletMiddlewareOptions &
  ProviderMiddlewareOptions & {
    privateKey?: string;
  };

export class WalletEngine extends JRPCEngine {
  providerFactory: EthereumPrivateKeyProvider;

  constructor(private options: WalletEngineOptions) {
    super();

    this.providerFactory = new EthereumPrivateKeyProvider({
      config: {
        chainConfig: options.chainConfig,
      },
    });
  }

  get provider() {
    if (!this.providerFactory.provider) {
      throw new Error('Wallet engine provider is not ready');
    }

    return this.providerFactory.provider;
  }

  async setupProvider(privateKey?: string) {
    /**
     * Use invalid private key to setup read-only provider in case no private key
     *
     * TODO: figure out a less hacky way, eg. by using own provider implementation
     */
    await this.providerFactory.setupProvider(privateKey || 'invalid-private-key');
  }

  async init() {
    this.push(createWalletMiddleware(this.options));
    this.push(createProviderMiddleware(this.options));

    await this.setupProvider(this.options.privateKey);

    if (this.providerFactory.provider) {
      this.push(ethersProviderAsMiddleware(this.providerFactory.provider) as JRPCMiddleware<unknown, unknown>);
    }
  }
}

export const createWalletEngine = async (options: WalletEngineOptions) => {
  const engine = new WalletEngine(options);
  await engine.init();

  return engine;
};
