import { ChainConfig } from '@cere-wallet/communication';
import { autorun, makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';

type SharedState = {
  network?: ChainConfig;
};

export class NetworkStore {
  private shared = createSharedState<SharedState>(
    `network.${this.wallet.instanceId}`,
    {},
    { readOnly: !this.wallet.isRoot() },
  );

  private gasPrice: BigNumber | undefined;

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    autorun(async () => {
      if (wallet.isReady()) {
        this.gasPrice = await this.wallet.provider?.getGasPrice()!;
      } else {
        this.gasPrice = undefined;
      }
    });
  }

  get network() {
    return this.shared.state.network;
  }

  set network(config: ChainConfig | undefined) {
    this.shared.state.network = config;
  }

  get fee() {
    return this.gasPrice ? ethers.utils.formatEther(this.gasPrice) : '';
  }
}
