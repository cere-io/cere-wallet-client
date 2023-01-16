import { makeAutoObservable, autorun } from 'mobx';

import { Wallet, Asset } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { CustomToken } from './CustomToken';
import { serializeAssets, deserializeAssets } from './helper';

export class AssetStore {
  private assets: Asset[] = [];
  private managableAssets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
    this.list = [];

    const managableTokensFromStorage = localStorage.getItem('tokens');
    const parsedAssets: Asset[] = deserializeAssets(managableTokensFromStorage) || [];

    autorun(() => {
      if (wallet.isReady()) {
        this.list = [new CereNativeToken(wallet), new NativeToken(wallet), new Erc20Token(wallet)];

        this.managableAssets = parsedAssets.map((asset) => new CustomToken(wallet, asset));
      }
    });
  }

  get managableList() {
    return this.managableAssets;
  }

  set managableList(assets: Asset[]) {
    this.managableAssets = assets;
    localStorage.setItem('tokens', serializeAssets(assets));
  }

  get list() {
    return this.assets;
  }

  set list(assets: Asset[]) {
    this.assets = assets;
  }

  get commonList() {
    return [...this.list, ...this.managableAssets];
  }

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  public addAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.managableList = [...this.managableList, new CustomToken(this.wallet, assetParams)];
    }
  }

  public deleteAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.managableList = this.managableList.filter((asset) => assetParams.ticker !== asset.ticker);
    }
  }
}
