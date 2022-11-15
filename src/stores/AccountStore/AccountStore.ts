import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccount } from '@cere-wallet/wallet-engine';

import { User, Wallet } from '../types';
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

  get accounts() {
    if (!this.userInfo || !this.privateKey) {
      return [];
    }

    const { name } = this.userInfo;
    const privateKey = this.privateKey;

    return [getAccount({ type: 'ethereum', name, privateKey }), getAccount({ type: 'ed25519', name, privateKey })];
  }

  get account() {
    return this.accounts.at(0);
  }

  get user(): User | undefined {
    if (!this.userInfo) {
      return undefined;
    }

    const { email, name, profileImage } = this.userInfo;

    return {
      email,
      name: name || email,
      avatar: profileImage,
    };
  }

  get userInfo() {
    return this.loginData?.userInfo;
  }

  get privateKey() {
    return this.loginData?.privateKey;
  }
}
