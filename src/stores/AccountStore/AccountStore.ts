import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { AccountAssetStore } from './AccountAssetStore';
import { AccountBalanceStore } from './AccountBalanceStore';

type LoginData = {
  privateKey: string;
  userInfo: UserInfo;
};

export type Account = {
  address: string;
  privateKey: string;
  email: string;
  avatar?: string;
};

type SharedState = {
  loginData?: LoginData;
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

  private set loginData(loginData: LoginData | undefined) {
    this.shared.state.loginData = loginData;
  }

  private get loginData() {
    return this.shared.state.loginData;
  }

  get account(): Account | undefined {
    if (!this.loginData) {
      return undefined;
    }

    return {
      privateKey: this.loginData.privateKey,
      address: getAccountAddress(this.loginData.privateKey),
      email: this.loginData.userInfo.email,
      avatar: this.loginData.userInfo.profileImage,
    };
  }

  get userInfo() {
    return this.loginData?.userInfo;
  }

  async login(data: LoginData) {
    this.loginData = data;

    return true;
  }

  async rehydrate() {
    return false;
  }

  async logout() {
    this.loginData = undefined;

    return true;
  }
}
