import { makeAutoObservable } from 'mobx';
import { getTokenConfig } from '@cere-wallet/wallet-engine';

import { Asset } from '../types';
import { AssetStore } from '../AssetStore';

export class BalanceStore {
  selectedToken: Omit<Asset, 'balance'>;

  constructor(private assetStore: AssetStore) {
    makeAutoObservable(this);

    const token = getTokenConfig();
    this.selectedToken = {
      displayName: token.symbol,
      ticker: token.symbol,
      network: 'Polygon',
    };
  }

  get nativeBalance() {
    return this.assetStore.nativeToken?.balance;
  }

  get balance() {
    const selectedToken = this.assetStore.list.find(({ ticker }) => this.selectedToken.ticker === ticker);

    return selectedToken?.balance;
  }
}
