import { makeAutoObservable } from 'mobx';
import BigNumber from 'bignumber.js';

import { ETH, COINGECKO_PLATFORMS_CHAIN_CODE_MAP, COINGECKO_SUPPORTED_CURRENCIES, tokens } from './enums';
import { idleTimeTracker } from './utils';
import { CurrencyStore, Wallet } from '~/stores';

const DEFAULT_INTERVAL = 10 * 1000;
const COIN_GECKO_API_PRICE = 'https://api.coingecko.com/api/v3/simple/price/';

type ExchangeRates = Record<string, number>;

export class ExchangeRatesStore {
  private currency: CurrencyStore;
  private chainId?: string;
  private _handle: NodeJS.Timer | null = null;
  private _exchangeRates: ExchangeRates = {};

  constructor(wallet: Wallet) {
    makeAutoObservable(this);

    this.chainId = wallet.network?.chainId;
    this.currency = new CurrencyStore();
    this.interval = DEFAULT_INTERVAL;
  }

  async updateExchangeRates() {
    console.log('UPDATED EXCHANGE RATES', this.chainId);
    const contractExchangeRates: ExchangeRates = {};
    if (!this.chainId) {
      return;
    }

    const platform = COINGECKO_PLATFORMS_CHAIN_CODE_MAP[Number(this.chainId)]?.platform;
    const nativeCurrency = this.currency ? this.currency.nativeCurrency.toLowerCase() : ETH;
    const supportedCurrency = COINGECKO_SUPPORTED_CURRENCIES.has(nativeCurrency)
      ? nativeCurrency
      : this.currency?.commonDenomination.toLowerCase() || ETH;

    const pairs = tokens.join(',');
    const query = `contract_addresses=${pairs}&vs_currencies=${supportedCurrency}`;

    let conversionFactor = 1;
    if (supportedCurrency !== nativeCurrency) {
      conversionFactor = this.currency.commonDenominatorPrice || 1;
    }

    if (tokens.length > 0 && platform) {
      try {
        const response = await fetch(`${COIN_GECKO_API_PRICE}${platform}?${query}`);
        const prices = await response.json();
        tokens.forEach(({ name: tokenName }) => {
          const price = prices[tokenName];
          contractExchangeRates[tokenName] =
            price && conversionFactor ? new BigNumber(price[supportedCurrency]).div(conversionFactor).toNumber() : 0;
        });
        this.exchangeRates = contractExchangeRates;
      } catch (error) {
        console.warn('MetaMask - TokenRatesController exchange rate fetch failed.', error);
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
