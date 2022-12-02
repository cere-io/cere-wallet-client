import { makeAutoObservable } from 'mobx';
import { getTokenConfig } from '@cere-wallet/wallet-engine';

import { Asset, Wallet } from '../types';
import { AssetStore } from '../AssetStore';
import { ExchangeRatesStore } from '../ExchangeRatesStore';
import { CurrencyStore } from '../CurrencyStore';
import { USD } from '../ExchangeRatesStore/enums';

export class BalanceStore {
  exchangeRatesStore: ExchangeRatesStore;
  currencyStore: CurrencyStore;

  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this);
    this.exchangeRatesStore = new ExchangeRatesStore(wallet);
    this.currencyStore = new CurrencyStore();
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

  get selectedTokenUsdBalance() {
    const selectedToken = this.assetStore.list.find(({ ticker }) => this.selectedToken?.ticker === ticker);
    const { exchangeRates } = this.exchangeRatesStore;

    if (!selectedToken) {
      return 0;
    }

    const rate = exchangeRates[USD] || 1;

    return Math.floor(selectedToken.balance! * rate);
  }
}
