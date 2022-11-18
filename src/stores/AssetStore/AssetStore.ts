import { autorun, makeAutoObservable } from 'mobx';
import { Asset, Wallet } from '../types';
import { Erc20Token } from './Erc20Token';
import { NativeToken } from './NativeToken';

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
