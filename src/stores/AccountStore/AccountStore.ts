import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';

import { Account, Wallet } from '../types';
import { createSharedState } from '../sharedState';

type LoginData = {
  privateKey: string;
  userInfo: UserInfo;
};

type SharedState = {
  loginData?: LoginData;
};

export class AccountStore {
  private shared = createSharedState<SharedState>(
    `account.${this.wallet.instanceId}`,
    {},
    { readOnly: !this.wallet.isRoot },
  );

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
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
