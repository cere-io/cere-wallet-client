import { makeAutoObservable, when } from 'mobx';

import { PriceData, Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { Erc20Token } from './Erc20Token';

export type Activity = {
  type: 'in' | 'out';
  hash: string;
  asset: string;
  flow: PriceData;
  date: string;
  to: string;
  from: string;
};

type SharedState = {
  list: Activity[];
};

export class ActivityStore {
  private shared = createSharedState<SharedState>(
    `activity.${this.wallet.instanceId}`,
    {
      list: [],
    },
    { readOnly: !this.wallet.isRoot },
  );

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    when(
      () => !!wallet.provider,
      () => this.onReady(),
    );
  }

  private async onReady() {
    new Erc20Token(this, this.wallet);
  }

  get list() {
    return this.shared.state.list;
  }

  addActivity(activity: Activity) {
    const exists = this.list.some(({ hash }) => activity.hash === hash);

    if (!exists) {
      this.list.push(activity);
    }
  }
}
