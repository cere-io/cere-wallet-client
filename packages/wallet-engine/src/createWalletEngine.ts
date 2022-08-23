import { JRPCEngine, JRPCMiddleware } from '@toruslabs/openlogin-jrpc';
import { ethersProviderAsMiddleware, SafeEventEmitterProvider } from 'eth-json-rpc-middleware';

import {
  createWalletMiddleware,
  createProviderMiddleware,
  WalletMiddlewareOptions,
  ProviderMiddlewareOptions,
} from './middleware';

export type WalletEngine = JRPCEngine;
export type WalletEngineOptions = WalletMiddlewareOptions &
  ProviderMiddlewareOptions & {
    provider: SafeEventEmitterProvider;
  };

export const createWalletEngine = (options: WalletEngineOptions) => {
  const engine = new JRPCEngine();

  engine.push(createWalletMiddleware(options));
  engine.push(createProviderMiddleware(options));
  engine.push(ethersProviderAsMiddleware(options.provider) as JRPCMiddleware<unknown, unknown>);

  return engine;
};
