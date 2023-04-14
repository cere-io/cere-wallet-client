import { PendingJsonRpcResponse, getUniqueId } from 'json-rpc-engine';
import { EventEmitter } from 'events';

import { Engine } from './engine';
import { Provider, Account, ProviderRequestArguments } from '../types';

import type { ApproveEngineOptions } from './approve';
import type { WalletEngineOptions } from './wallet';
import type { EthereumEngineOptions } from './ethereum';
import type { PolkadotEngineOptions } from './polkadot';

export type ProviderEngineOptions = WalletEngineOptions &
  ApproveEngineOptions &
  EthereumEngineOptions &
  PolkadotEngineOptions;

class EngineProvider extends EventEmitter implements Provider {
  constructor(private engine: Engine) {
    super();

    engine.forwardEvents(this);
  }

  async request<T = any>({ method, params }: ProviderRequestArguments): Promise<T> {
    const response = await this.engine.handle<unknown, T>({ method, params, id: getUniqueId(), jsonrpc: '2.0' });
    const { result, error } = response as PendingJsonRpcResponse<T>;

    return error ? Promise.reject(error) : result!;
  }
}

export class ProviderEngine extends Engine {
  readonly provider: Provider = new EngineProvider(this);

  constructor(private options: ProviderEngineOptions) {
    super();

    this.pushEngine(async () => {
      const { createWalletEngine } = await import(/* webpackChunkName: "createWalletEngine" */ './wallet');

      return createWalletEngine(this.options);
    });

    this.pushEngine(async () => {
      const { createApproveEngine } = await import(/* webpackChunkName: "createApproveEngine" */ './approve');

      return createApproveEngine(this.options);
    });

    this.pushEngine(async () => {
      const { createPolkadotEngine } = await import(/* webpackChunkName: "createPolkadotEngine" */ './polkadot');

      return createPolkadotEngine(this.options);
    });

    /**
     * Should always be the last one since it is currently handles real RPC requests
     * TODO: Replace with fetch middleware in future
     */
    this.pushEngine(async () => {
      const { createEthereumEngine } = await import(/* webpackChunkName: "createEthereumEngine" */ './ethereum');

      return createEthereumEngine(this.options);
    });
  }

  async updateAccounts(accounts: Account[]) {
    await this.provider.request({ method: 'wallet_updateAccounts', params: [accounts] });

    this.emit('message', {
      type: 'wallet_accountsChanged',
      data: accounts,
    });
  }
}
