import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { AccountAssets } from './AccountAssets';
import { AccountBalance } from './AccountBalance';

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
  private assets: AccountAssets;
  private balance: AccountBalance;

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);

    this.assets = new AccountAssets(wallet);
    this.balance = new AccountBalance(this.assets);
  }

  get account() {
    return this.shared.state.account;
  }

  set account(account: Account | undefined) {
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
