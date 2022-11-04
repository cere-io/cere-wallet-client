import { makeAutoObservable, autorun } from 'mobx';

import { Wallet, Asset } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';

export class AssetStore {
  assets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    autorun(() => {
      this.assets = wallet.isReady() ? [new NativeToken(wallet), new Erc20Token(wallet)] : [];
    });
  }

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  get list() {
    return this.assets;
  }
}
