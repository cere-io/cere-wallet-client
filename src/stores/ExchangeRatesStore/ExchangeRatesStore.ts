import { makeAutoObservable } from 'mobx';
import BigNumber from 'bignumber.js';

import { COINGECKO_PLATFORMS_CHAIN_CODE_MAP, COINGECKO_SUPPORTED_CURRENCIES, TOKENS } from './enums';
import { idleTimeTracker } from './utils';
import { CurrencyStore, Wallet } from '~/stores';

const DEFAULT_INTERVAL = 30 * 1000;
const COIN_GECKO_API_PRICE = 'https://api.coingecko.com/api/v3/simple/price';

type ExchangeRates = Record<string, Record<string, number>>;

export class ExchangeRatesStore {
  private currency: CurrencyStore;
  private _handle: NodeJS.Timer | null = null;
  private _exchangeRates: ExchangeRates = {};

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
    this.currency = new CurrencyStore();
    this.interval = DEFAULT_INTERVAL;
    this.updateExchangeRates();
  }

  async updateExchangeRates() {
    const chainId = this.wallet.network?.chainId;
    const { currentCurrency } = this.currency;
    const contractExchangeRates: ExchangeRates = {};
    if (!chainId) {
      return;
    }

    const platform = COINGECKO_PLATFORMS_CHAIN_CODE_MAP[chainId]?.platform;
    const supportedCurrencies = COINGECKO_SUPPORTED_CURRENCIES.join(',');

    const pairs = TOKENS.map(({ id }) => id).join(',');
    const query = `ids=${pairs}&vs_currencies=${supportedCurrencies}`;

    let conversionFactor = 1;

    if (platform) {
      try {
        const response = await fetch(`${COIN_GECKO_API_PRICE}?${query}`);
        const prices = await response.json();
        TOKENS.forEach(({ name: tokenName }) => {
          const price = prices[tokenName];
          contractExchangeRates[tokenName] = contractExchangeRates[tokenName] || {};

          if (price && conversionFactor) {
            contractExchangeRates[tokenName][currentCurrency] = new BigNumber(price[currentCurrency])
              .div(conversionFactor)
              .toNumber();
          } else {
            contractExchangeRates[tokenName][currentCurrency] = 0;
          }
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
