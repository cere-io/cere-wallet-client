import { ChainConfig } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

export class NetworkStore {
  network?: ChainConfig;

  constructor() {
    makeAutoObservable(this);
  }

  setNetwork(config: ChainConfig) {
    this.network = config;
  }
}
