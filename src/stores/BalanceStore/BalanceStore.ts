import { makeAutoObservable, action } from 'mobx';

import { Wallet } from '../types';
import { AssetStore } from '../AssetStore';
import { ExchangeRatesStore } from '../ExchangeRatesStore';
import { USD, DEFAULT_RATE } from '../ExchangeRatesStore/enums';

export class BalanceStore {
  exchangeRatesStore: ExchangeRatesStore;

  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this, {
      getUsdBalance: action.bound,
    });

    this.exchangeRatesStore = new ExchangeRatesStore(this.wallet, this.assetStore);
  }

  /**
   * Not used logic
   * TODO: Uncoment it when select balance token functionality is implemented
   */

  // get selectedToken(): Omit<Asset, 'balance' | 'id'> | undefined {
  //   if (!this.wallet.network) {
  //     return undefined;
  //   }

  //   const token = getTokenConfig();

  //   return {
  //     decimals: token.decimals,
  //     displayName: token.symbol,
  //     ticker: token.symbol,
  //     network: this.wallet.network.displayName,
  //   };
  // }

  // get balance() {
  //   const selectedToken = this.assetStore.commonList.find(({ ticker }) => this.selectedToken?.ticker === ticker);

  //   return selectedToken?.balance;
  // }

  get nativeBalance() {
    return this.assetStore.nativeToken?.balance;
  }

  get totalUsdBalance() {
    const { exchangeRates } = this.exchangeRatesStore;
    return this.assetStore.commonList.reduce<number>((total, item) => {
      const rate = exchangeRates[item.ticker]?.[USD.toUpperCase()] || DEFAULT_RATE;
      const balance = (item.balance || 0) * rate;

      return total + balance;
    }, 0);
  }

  public getUsdBalance(tickerName: string, balance: number = 0) {
    const { exchangeRates } = this.exchangeRatesStore;
    const rate = exchangeRates[tickerName]?.[USD.toUpperCase()] || DEFAULT_RATE;

    return balance * rate;
  }
}
