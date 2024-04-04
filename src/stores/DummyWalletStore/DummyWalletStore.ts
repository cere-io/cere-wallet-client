import { randomBytes } from 'crypto';
import { DEFAULT_NETWORK, getChainConfig } from '@cere-wallet/communication';

import type { Wallet } from '../types';
import { AppContextStore } from '../AppContextStore';
import { NetworkStore } from '../NetworkStore';

export class DummyWalletStore implements Wallet {
  readonly instanceId: string;
  readonly accounts = [];
  readonly appContextStore: AppContextStore;
  readonly networkStore: NetworkStore;

  private isRootInstance = false;

  constructor(instanceId?: string) {
    this.instanceId = instanceId || randomBytes(16).toString('hex');

    this.appContextStore = new AppContextStore(this);
    this.networkStore = new NetworkStore(this);

    this.setup(!instanceId);
  }

  protected async setup(isRoot: boolean) {
    this.isRootInstance = isRoot;

    if (isRoot) {
      this.networkStore.network = getChainConfig(DEFAULT_NETWORK);
    }
  }

  get network() {
    return this.networkStore.network;
  }

  isReady() {
    return false;
  }

  isRoot() {
    return this.isRootInstance;
  }
}
