import { makeAutoObservable, autorun } from 'mobx';

import { Wallet, Asset, ReadyWallet } from '../types';
import { NativeToken } from './NativeToken';
import { Erc20Token } from './Erc20Token';
import { CereNativeToken } from './CereNativeToken';
import { CustomToken } from './CustomToken';

const COIN_GECKO_API_TRENDING = 'https://api.coingecko.com/api/v3/search/trending';

export class AssetStore {
  private assets: Asset[] = [];
  private popular: Asset[] = [];
  private nativeTokens: Asset[] = [];

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

        this.getPopularTokens(wallet);
      }
    });

    autorun(() => {
      localStorage.setItem('tokens', JSON.stringify(this.list));
    });
  }

  get list() {
    return this.assets;
  }

  set list(assets: Asset[]) {
    this.assets = assets;
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

  private async getPopularTokens(wallet: ReadyWallet) {
    try {
      const response = await fetch(COIN_GECKO_API_TRENDING);
      const { coins } = await response.json();
      const items = [...coins, ...this.nativeTokens];

      this.popularList = items.reduce((acc: Asset[], { item }: Record<string, any>) => {
        const addedToken = this.list.find((asset) => asset.ticker === item.ticker);
        if (!addedToken) {
          acc.push(
            new CustomToken(wallet, {
              ticker: item.symbol,
              displayName: item.name,
              network: item.network,
              thumb: item.thumb,
              balance: 0,
            }),
          );
        }

        return acc;
      }, []);
    } catch (error) {
      console.warn('CoinGecko rates fetch failed.', error);
    }
  }
}
