import { makeAutoObservable, autorun } from 'mobx';

import { Wallet, Asset } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { CustomToken } from './CustomToken';

export class AssetStore {
  private assets: Asset[] = [];
  private managableAssets: Asset[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
    this.list = [];

    const managableTokensFromStorage = localStorage.getItem('tokens');
    const parsedAssets: Asset[] = managableTokensFromStorage ? JSON.parse(managableTokensFromStorage) : [];

    autorun(() => {
      if (wallet.isReady()) {
        const nativeTokens = [new CereNativeToken(wallet), new NativeToken(wallet), new Erc20Token(wallet)];
        this.list = nativeTokens;

        this.managableAssets = parsedAssets.map((asset) => new CustomToken(wallet, asset));
      }
    });
  }

  get managableList() {
    return this.managableAssets;
  }

  set managableList(assets: Asset[]) {
    const serializedTokens = assets.map((el) => ({
      ticker: el.symbol,
      displayName: el.displayName,
      network: el.network,
      address: el.address,
      thumb: el.thumb,
      symbol: el.symbol,
      decimals: el.decimals,
      balance: el.balance,
    }));

    localStorage.setItem('tokens', JSON.stringify(serializedTokens));
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
      this.list = [...this.list, new CustomToken(this.wallet, assetParams)];
    }
  }

  public deleteAsset(assetParams: Asset): void {
    if (this.wallet.isReady()) {
      this.list = this.list.filter((asset) => assetParams.ticker !== asset.ticker);
    }
  }
}
