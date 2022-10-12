import { JRPCEngine, JRPCMiddleware } from '@toruslabs/openlogin-jrpc';
import { ethersProviderAsMiddleware, SafeEventEmitterProvider } from 'eth-json-rpc-middleware';

import {
  createWalletMiddleware,
  createProviderMiddleware,
  WalletMiddlewareOptions,
  ProviderMiddlewareOptions,
} from './middleware';

export class WalletEngine extends JRPCEngine {
  constructor(private options: WalletEngineOptions) {
    super();

    this.push(createWalletMiddleware(options));

    if (options.provider) {
      this.setupProvider(options.provider);
    }
  }

  setupProvider(provider: SafeEventEmitterProvider) {
    this.push(createProviderMiddleware(this.options));
    this.push(ethersProviderAsMiddleware(provider) as JRPCMiddleware<unknown, unknown>);
  }
}

export type WalletEngineOptions = WalletMiddlewareOptions &
  ProviderMiddlewareOptions & {
    provider?: SafeEventEmitterProvider;
  };

export const createWalletEngine = (options: WalletEngineOptions) => {
  return new WalletEngine(options);
};
