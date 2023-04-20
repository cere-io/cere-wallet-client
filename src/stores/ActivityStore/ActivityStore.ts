import { makeAutoObservable, reaction } from 'mobx';

import { PriceData, ReadyWallet, Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { AssetStore } from '../AssetStore';

import type { Erc20Token } from './Erc20Token';
import type { CustomToken } from './CustomToken';

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
  private startedTokens: (CustomToken | Erc20Token)[] = [];
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
      () => wallet.isReady(),
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
    const { CustomToken } = await import(/* webpackChunkName: "ActivityCustomToken" */ './CustomToken');
    const { Erc20Token } = await import(/* webpackChunkName: "ActivityErc20Token" */ './Erc20Token');

    this.startedTokens = this.assetStore.managableList.map((asset) => {
      const token = new CustomToken(this, asset.address!);

      token.start(wallet);

      return token;
    });

    const erc20token = new Erc20Token(this);
    erc20token.start(wallet);

    this.startedTokens.push(erc20token);
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
