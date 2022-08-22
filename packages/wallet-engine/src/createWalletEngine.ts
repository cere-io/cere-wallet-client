import { JRPCEngine } from '@toruslabs/openlogin-jrpc';

import {
  createWalletMiddleware,
  createEthereumProviderMiddleware,
  createSignerMiddleware,
  EthereumProviderMiddlewareOptions,
  WalletMiddlewareOptions,
  SignerMiddlewareOptions,
} from './middleware';

export type WalletEngine = JRPCEngine;
export type WalletEngineOptions = EthereumProviderMiddlewareOptions & WalletMiddlewareOptions & SignerMiddlewareOptions;

export const createWalletEngine = async (options: WalletEngineOptions): Promise<WalletEngine> => {
  const engine = new JRPCEngine();

  engine.push(createWalletMiddleware(options));
  engine.push(createSignerMiddleware(options));
  engine.push(await createEthereumProviderMiddleware(options));

  return engine;
};
