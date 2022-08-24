import { ChainConfig } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';
import { createSharedState } from '../sharedState';

type SharedState = {
  network?: ChainConfig;
};

export class NetworkStore {
  private shared = createSharedState<SharedState>(`network.${this.instanceId}`, {});

  constructor(private instanceId: string) {
    makeAutoObservable(this);
  }

  get network() {
    return this.shared.state.network;
  }

  set network(config: ChainConfig | undefined) {
    this.shared.state.network = config;
  }
}
