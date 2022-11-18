import { makeAutoObservable } from 'mobx';
import { ChainConfig } from '@cere-wallet/communication';
import { createSharedState } from '../sharedState';
import { Wallet } from '../types';

type SharedState = {
  network?: ChainConfig;
};

export class NetworkStore {
  private shared = createSharedState<SharedState>(
    `network.${this.wallet.instanceId}`,
    {},
    { readOnly: !this.wallet.isRoot() },
  );

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
