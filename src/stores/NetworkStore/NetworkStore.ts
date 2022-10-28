import { ChainConfig, getChainConfig, DEFAULT_NETWORK } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';

type SharedState = {
  network?: ChainConfig;
};

const defaultNetwork = getChainConfig(DEFAULT_NETWORK);

export class NetworkStore {
  private shared = createSharedState<SharedState>(
    `network.${this.wallet.instanceId}`,
    {
      network: defaultNetwork,
    },
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
