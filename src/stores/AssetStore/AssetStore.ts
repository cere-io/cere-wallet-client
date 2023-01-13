import { makeAutoObservable, autorun } from 'mobx';

import { Wallet, Asset } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { CustomToken } from './CustomToken';

export class AssetStore {
  private assets: Asset[] = [];
  private popular: Asset[] = [];
  public nativeTokens: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
    this.list = [];

    autorun(() => {
      if (wallet.isReady()) {
        const preservedTokensFromStorage = localStorage.getItem('tokens');
        const preservedTokens = preservedTokensFromStorage ? JSON.parse(preservedTokensFromStorage) : [];
        const nativeTokens = [new CereNativeToken(wallet), new NativeToken(wallet), new Erc20Token(wallet)];
        this.list = preservedTokens.length > 0 ? preservedTokens : nativeTokens;
        this.nativeTokens = nativeTokens;
      }
    });
  }

  get list() {
    return this.assets;
  }

  set list(assets: Asset[]) {
    this.assets = assets;
    localStorage.setItem('tokens', JSON.stringify(this.assets));
  }

  get popularList() {
    return this.popular;
  }

  set popularList(assets: Asset[]) {
    this.popular = assets;
  }

  get nativeToken() {
    return this.assets.find(({ ticker }) => ticker === this.wallet.network?.ticker);
  }

  public addAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.list = [...this.list, new CustomToken(this.wallet, assetParams)];
    }
  }

  public deleteAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.list = this.list.filter((asset) => assetParams.ticker !== asset.ticker);
    }
  }
}
