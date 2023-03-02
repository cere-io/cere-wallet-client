import { makeAutoObservable, when } from 'mobx';

import { COINGECKO_PLATFORMS_CHAIN_CODE_MAP, COINGECKO_SUPPORTED_CURRENCIES } from './enums';
import { idleTimeTracker } from './utils';
import { Wallet } from '~/stores';
import { AssetStore } from '../AssetStore';

const DEFAULT_INTERVAL = 30 * 1000;
const API_URL = 'https://min-api.cryptocompare.com/data/pricemulti';

type ExchangeRates = Record<string, Record<string, number>>;

export class ExchangeRatesStore {
  private _handle: NodeJS.Timer | null = null;
  private _exchangeRates: ExchangeRates = {};

  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this);
    this.interval = DEFAULT_INTERVAL;
    when(
      () => this.assetStore.commonList.length > 0,
      () => this.updateExchangeRates(),
    );

    when(
      () => !!wallet.network?.chainId,
      () => this.updateExchangeRates(),
    );
  }

  async updateExchangeRates() {
    const chainId = this.wallet.network?.chainId;
    const contractExchangeRates: ExchangeRates = {};

    if (!chainId) {
      return;
    }

    const tokens = this.assetStore.commonList;

    const platform = COINGECKO_PLATFORMS_CHAIN_CODE_MAP[chainId]?.platform;
    const supportedCurrencies = COINGECKO_SUPPORTED_CURRENCIES.join(',');
    const pairs = tokens.map(({ ticker }) => ticker).join(',');
    const query = `fsyms=${pairs},ETH&tsyms=${supportedCurrencies}`;

    if (platform) {
      try {
        const response = await fetch(`${API_URL}?${query}`);
        const prices = await response.json();
        tokens.forEach(({ ticker }) => {
          contractExchangeRates[ticker] = prices[ticker];
        });
        this.exchangeRates = contractExchangeRates;
      } catch (error) {
        console.warn('Rates fetch failed.', error);
      }
    }
  }

  set interval(interval: number) {
    if (this._handle) clearInterval(this._handle);
    if (!interval) {
      return;
    }
    this._handle = setInterval(() => {
      if (!idleTimeTracker.checkIfIdle()) {
        this.updateExchangeRates();
      }
    }, interval);
  }

  set exchangeRates(rates: ExchangeRates) {
    this._exchangeRates = rates;
  }

  get exchangeRates() {
    return this._exchangeRates;
  }
}
