import { JsonRpcEngine, PendingJsonRpcResponse } from 'json-rpc-engine';
import { EventEmitter } from 'events';

import {
  createWalletMiddleware,
  createApproveMiddleware,
  createEthereumMiddleware,
  WalletMiddlewareOptions,
  ApproveMiddlewareOptions,
  EthereumMiddlewareOptions,
} from './middleware';
import { Provider, ProviderRequestArguments } from './types';

export type WalletEngineOptions = WalletMiddlewareOptions & ApproveMiddlewareOptions & EthereumMiddlewareOptions;

class EngineProvider extends EventEmitter implements Provider {
  constructor(private engine: WalletEngine) {
    super();
  }

  async request<T = any>({ method, params }: ProviderRequestArguments): Promise<T> {
    const response = await this.engine.handle<unknown, T>({ method, params, id: undefined, jsonrpc: '2.0' });
    const { result, error } = response as PendingJsonRpcResponse<T>;

    return error ? Promise.reject(error) : result!;
  }
}

export class WalletEngine extends JsonRpcEngine {
  readonly provider: Provider = new EngineProvider(this);

  constructor(private options: WalletEngineOptions) {
    super();

    this.push(createWalletMiddleware(this.options));
    this.push(createApproveMiddleware(this.options));
    this.push(createEthereumMiddleware(this.options));
  }
}

export const createWalletEngine = (options: WalletEngineOptions) => {
  return new WalletEngine(options);
};
