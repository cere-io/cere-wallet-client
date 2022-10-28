import { makeAutoObservable, when } from 'mobx';

import { Wallet, Asset } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';

export class AssetStore {
  assets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    when(
      () => !!wallet.provider && !!wallet.account,
      () => this.onReady(),
    );
  }

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  get list() {
    return this.assets;
  }

  private async onReady() {
    this.assets = [new NativeToken(this.wallet), new Erc20Token(this.wallet)];
  }
}
