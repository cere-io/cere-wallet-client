import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';

import { Account, Wallet } from '../types';
import { createSharedState } from '../sharedState';

export type AccountLoginData = {
  privateKey: string;
  userInfo: UserInfo;
};

type SharedState = {
  loginData: AccountLoginData | null;
};

export class AccountStore {
  private shared = createSharedState<SharedState>(
    `account.${this.wallet.instanceId}`,
    { loginData: null },
    { readOnly: !this.wallet.isRoot() },
  );

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
  }

  set loginData(loginData: AccountLoginData | null) {
    this.shared.state.loginData = loginData;
  }

  get loginData() {
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
      verifier: this.loginData.userInfo.verifier,
    };
  }

  get userInfo() {
    return this.loginData?.userInfo;
  }
}
