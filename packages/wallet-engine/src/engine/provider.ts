import { PendingJsonRpcResponse, getUniqueId } from 'json-rpc-engine';
import { EventEmitter } from 'events';

import { Engine } from './engine';
import { Provider, ProviderRequestArguments } from '../types';

import { createWalletEngine, WalletEngineOptions } from './wallet';
import { createApproveEngine, ApproveEngineOptions } from './approve';
import type { EthereumEngineOptions } from './ethereum';
import type { PolkadotEngineOptions } from './polkadot';
import type { AccountsEngineOptions } from './accounts';

export type ProviderEngineOptions = WalletEngineOptions &
  AccountsEngineOptions &
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

    this.pushEngine(createWalletEngine(options));
    this.pushEngine(createApproveEngine(options));

    this.pushEngine(async () => {
      const { createAccountsEngine } = await import(/* webpackChunkName: "accountsEngine" */ './accounts');

      return createAccountsEngine(options);
    });

    this.pushEngine(async () => {
      const { createPolkadotEngine } = await import(/* webpackChunkName: "polkadotEngine" */ './polkadot');

      return createPolkadotEngine(options);
    });

    /**
     * Should always be the last one since it is currently handles real RPC requests
     * TODO: Replace with fetch middleware in future
     */
    this.pushEngine(async () => {
      const { createEthereumEngine } = await import(/* webpackChunkName: "ethereumEngine" */ './ethereum');

      return createEthereumEngine(options);
    });
  }

  async updateAccounts() {
    const [eth, ed25519] = await this.provider.request({ method: 'wallet_updateAccounts' });

    /**
     * TODO: Move balance subscriptions to the Wallet SDK to make them lazy started
     */
    this.provider.request({
      method: 'eth_subscribeBalance',
      params: eth ? [eth.address] : [],
    });

    this.provider.request({
      method: 'ed25519_subscribeBalance',
      params: ed25519 ? [ed25519.address] : [],
    });
  }
}
