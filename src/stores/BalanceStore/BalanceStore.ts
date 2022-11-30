import { makeAutoObservable } from 'mobx';
import { getTokenConfig } from '@cere-wallet/wallet-engine';

import { Asset, Wallet } from '../types';
import { AssetStore } from '../AssetStore';

export class BalanceStore {
  constructor(private wallet: Wallet, private assetStore: AssetStore) {
    makeAutoObservable(this);
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
}
