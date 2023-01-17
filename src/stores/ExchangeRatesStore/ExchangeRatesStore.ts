import { makeAutoObservable, when } from 'mobx';

import { COINGECKO_PLATFORMS_CHAIN_CODE_MAP, COINGECKO_SUPPORTED_CURRENCIES, TOKENS } from './enums';
import { idleTimeTracker } from './utils';
import { Wallet } from '~/stores';
import { AssetStore } from '../AssetStore';

const DEFAULT_INTERVAL = 30 * 1000;
const COIN_GECKO_API_PRICE = 'https://api.coingecko.com/api/v3/simple/price';

type ExchangeRates = Record<string, Record<string, number>>;

export class ExchangeRatesStore {
  private _handle: NodeJS.Timer | null = null;
  private _exchangeRates: ExchangeRates = {};

  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this);
    this.interval = DEFAULT_INTERVAL;

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

    const pairs = tokens.map(({ id }) => id).join(',');
    const query = `ids=${pairs}&vs_currencies=${supportedCurrencies}`;

    if (platform) {
      try {
        const response = await fetch(`${COIN_GECKO_API_PRICE}?${query}`);
        const prices = await response.json();
        tokens.forEach(({ ticker }) => {
          contractExchangeRates[ticker] = prices[ticker];
        });
        this.exchangeRates = contractExchangeRates;
      } catch (error) {
        console.warn('CoinGecko rates fetch failed.', error);
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
