import { makeAutoObservable } from 'mobx';
import { getTokenConfig } from '@cere-wallet/wallet-engine';

import { Asset } from '../types';
import { AccountAssetStore } from './AccountAssetStore';

export class AccountBalanceStore {
  selectedToken: Omit<Asset, 'balance'>;

  constructor(private assets: AccountAssetStore) {
    makeAutoObservable(this);

    const token = getTokenConfig();
    this.selectedToken = {
      displayName: token.symbol,
      ticker: token.symbol.toLocaleLowerCase(),
      network: 'Polygon',
    };
  }

  get nativeBalance() {
    return this.assets.nativeToken?.balance;
  }

  get balance() {
    const selectedToken = this.assets.list.find(({ ticker }) => this.selectedToken.ticker === ticker);

    return selectedToken?.balance;
  }
}
