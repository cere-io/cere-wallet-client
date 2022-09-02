import { ChainConfig } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';

type SharedState = {
  network?: ChainConfig;
};

export class NetworkStore {
  private shared = createSharedState<SharedState>(`network.${this.wallet.instanceId}`, {});

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
  }

  get network() {
    return this.shared.state.network;
  }

  set network(config: ChainConfig | undefined) {
    this.shared.state.network = config;
  }
}
