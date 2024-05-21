import { PendingJsonRpcResponse, getUniqueId } from 'json-rpc-engine';
import { EventEmitter } from 'events';

import { Engine } from './engine';
import { Provider, ProviderRequestArguments } from '../types';

import { createWalletEngine, WalletEngineOptions } from './wallet';
import { createApproveEngine, ApproveEngineOptions } from './approve';
import { createPermissionsEngine, PermissionsEngineOptions } from './permissions';
import type { EthereumEngineOptions } from './ethereum';
import type { PolkadotEngineOptions } from './polkadot';
import type { AccountsEngineOptions } from './accounts';
import type { SolanaEngineOptions } from './solana';

export type ProviderEngineOptions = WalletEngineOptions &
  AccountsEngineOptions &
  ApproveEngineOptions &
  EthereumEngineOptions &
  PolkadotEngineOptions &
  SolanaEngineOptions &
  PermissionsEngineOptions;

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

class UnsafeEngine extends Engine {
  readonly provider: Provider = new EngineProvider(this);

  constructor(options: ProviderEngineOptions) {
    super();

    this.pushEngine(createWalletEngine(options));

    this.pushEngine(
      import(/* webpackChunkName: "accountsEngine" */ './accounts').then(({ createAccountsEngine }) =>
        createAccountsEngine(options),
      ),
    );

    this.pushEngine(async () => {
      const { createPolkadotEngine } = await import(/* webpackChunkName: "polkadotEngine" */ './polkadot');

      return createPolkadotEngine(options);
    });

    this.pushEngine(
      import(/* webpackChunkName: "accountsEngine" */ './solana').then(({ createSolanaEngine }) =>
        createSolanaEngine(options),
      ),
    );

    /**
     * Should always be the last one since it is currently handles real RPC requests
     * TODO: Replace with fetch middleware in future
     */
    this.pushEngine(async () => {
      const { createEthereumEngine } = await import(/* webpackChunkName: "ethereumEngine" */ './ethereum');

      return createEthereumEngine(options);
    });
  }
}

export class ProviderEngine extends Engine {
  readonly provider: Provider;
  readonly unsafeProvider;

  constructor(options: ProviderEngineOptions) {
    super();

    const unsafeEngine = new UnsafeEngine(options);

    this.provider = new EngineProvider(this);
    this.unsafeProvider = new EngineProvider(unsafeEngine);

    this.pushEngine(createPermissionsEngine(options, createApproveEngine(options)));
    this.pushEngine(unsafeEngine);
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
