import { EventEmitter } from 'events';
import { PendingJsonRpcResponse, getUniqueId } from 'json-rpc-engine';
import { Account, Provider, ProviderRequestArguments } from '../types';
import { ApproveEngineOptions, createApproveEngine } from './approve';
import { Engine } from './engine';
import { EthereumEngineOptions, createEthereumEngine } from './ethereum';
import { PolkadotEngineOptions, createPolkadotEngine } from './polkadot';
import { WalletEngineOptions, createWalletEngine } from './wallet';

export type ProviderEngineOptions = WalletEngineOptions &
  ApproveEngineOptions &
  EthereumEngineOptions &
  PolkadotEngineOptions;

class EngineProvider extends EventEmitter implements Provider {
  constructor(private engine: ProviderEngine) {
    super();
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

    this.pushEngine(createWalletEngine(this.options));
    this.pushEngine(createApproveEngine(this.options));
    this.pushEngine(createPolkadotEngine(this.options));

    /**
     * Should always be the last one since it is currently handles real RPC requests
     * TODO: Replace with fetch middleware in future
     */
    this.pushEngine(createEthereumEngine(this.options));
  }

  private pushEngine(engine: Engine) {
    this.push(engine.asMiddleware());

    /**
     * Forward all messages from sub-engine
     */
    engine.forwardEvents(this);
  }

  async updateAccounts(accounts: Account[]) {
    await this.provider.request({ method: 'wallet_updateAccounts', params: [accounts] });
  }
}
