import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { AccountAssetStore } from './AccountAssetStore';
import { AccountBalanceStore } from './AccountBalanceStore';

type LoginParams = {
  privateKey: string;
  userInfo: UserInfo;
};

type Account = {
  address: string;
  privateKey: string;
  userInfo: UserInfo;
};

type SharedState = {
  account?: Account;
};

export class AccountStore {
  private shared = createSharedState<SharedState>(`account.${this.wallet.instanceId}`, {});

  readonly assetStore: AccountAssetStore;
  readonly balanceStore: AccountBalanceStore;

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    this.assetStore = new AccountAssetStore(wallet);
    this.balanceStore = new AccountBalanceStore(this.assetStore);
  }

  get isAuthenticated() {
    return !!this.shared.state.account;
  }

  get address() {
    return this.shared.state.account?.address;
  }

  get privateKey() {
    return this.shared.state.account?.privateKey;
  }

  get userInfo() {
    return this.shared.state.account?.userInfo;
  }

  private set account(account: Account | undefined) {
    this.shared.state.account = account;
  }

  async login({ privateKey, userInfo }: LoginParams) {
    this.account = {
      privateKey,
      userInfo,
      address: getAccountAddress(privateKey),
    };

    return true;
  }

  async rehydrate() {
    return false;
  }

  async logout() {
    this.account = undefined;

    return true;
  }
}
