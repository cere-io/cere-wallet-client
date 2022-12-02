import { makeAutoObservable } from 'mobx';

export class CurrencyStore {
  public currentCurrency = 'usd';
  public conversionRate = 0;
  public conversionDate = 'N/A';
  public nativeCurrency = 'ETH';
  public commonDenomination = 'USD';
  public commonDenominatorPrice = 0;

  constructor() {
    makeAutoObservable(this);
  }
}
