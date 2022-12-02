import { makeAutoObservable } from 'mobx';
import { getTokenConfig } from '@cere-wallet/wallet-engine';

import { Asset, Wallet } from '../types';
import { AssetStore } from '../AssetStore';
import { ExchangeRatesStore } from '../ExchangeRatesStore';
import { USD } from '../ExchangeRatesStore/enums';

export class BalanceStore {
  exchangeRatesStore: ExchangeRatesStore;

  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this);
    this.exchangeRatesStore = new ExchangeRatesStore(this.wallet);
    this.getUsdBalance = this.getUsdBalance.bind(this);
  }

  get selectedToken(): Omit<Asset, 'balance'> | undefined {
    if (!this.wallet.network) {
      return undefined;
    }

    const token = getTokenConfig();

    return {
      displayName: token.symbol,
      ticker: token.symbol,
      network: this.wallet.network.displayName,
    };
  }

  get nativeBalance() {
    return this.assetStore.nativeToken?.balance;
  }

  get balance() {
    const selectedToken = this.assetStore.list.find(({ ticker }) => this.selectedToken?.ticker === ticker);

    return selectedToken?.balance;
  }

  get totalUsdBalance() {
    const { exchangeRates } = this.exchangeRatesStore;
    return this.assetStore.list.reduce<number>((total, item) => {
      const rate = exchangeRates[item.ticker]?.[USD] || 1;
      const balance = (item.balance || 0) * rate;
      return total + balance;
    }, 0);
  }

  public getUsdBalance(tickerName: string, balance: number = 0) {
    const { exchangeRates } = this.exchangeRatesStore;
    const rate = exchangeRates[tickerName]?.[USD] || 1;

    return balance * rate;
  }
}
