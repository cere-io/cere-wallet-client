import { makeAutoObservable, autorun } from 'mobx';

import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { isTransferableAsset, Wallet, Asset } from './types';

export class AssetStore {
  private assets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    autorun(() => {
      this.list = wallet.isReady()
        ? [new CereNativeToken(wallet), new NativeToken(wallet), new Erc20Token(wallet)]
        : [];
    });
  }

  get list() {
    return this.assets;
  }

  set list(assets: Asset[]) {
    this.assets = assets;
  }

  get transferable() {
    return this.assets.filter(isTransferableAsset);
  }

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  getAsset(ticker: string) {
    return this.assets.find((asset) => asset.ticker === ticker);
  }

  transfer(ticker: string, to: string, amount: string) {
    const asset = this.transferable.find((asset) => asset.ticker === ticker);

    if (!asset) {
      throw new Error('Cannot transfer - unknown asset');
    }

    return asset.transfer(to, amount);
  }
}
