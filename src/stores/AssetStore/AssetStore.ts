import { makeAutoObservable, autorun } from 'mobx';

import { Wallet, Asset } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { CustomToken } from './CustomToken';

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

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  public addAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.list = [...this.list, new CustomToken(this.wallet, assetParams)];
    }
  }
}
