import { makeAutoObservable, reaction } from 'mobx';

import { PriceData, ReadyWallet, Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { AssetStore } from '../AssetStore';

import type { Erc20Token } from './Erc20Token';

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
  private startedTokens: Erc20Token[] = [];
  private shared = createSharedState<SharedState>(
    `activity.${this.wallet.instanceId}`,
    {
      list: [],
    },
    { readOnly: !this.wallet.isRoot() },
  );

  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this);

    reaction(
      () => wallet.isReady() && assetStore.commonList.length > 0,
      (isReady) => {
        if (isReady) {
          this.init(wallet as ReadyWallet);
        } else {
          this.cleanUp();
        }
      },
    );
  }

  async init(wallet: ReadyWallet) {
    const { Erc20Token } = await import(/* webpackChunkName: "walletAssetActivity" */ './Erc20Token');

    this.startedTokens = this.assetStore.commonList
      .filter((asset) => asset.address)
      .map((asset) => new Erc20Token(this, asset).start(wallet));
  }

  async cleanUp() {
    this.startedTokens.forEach((token) => token.stop());
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
