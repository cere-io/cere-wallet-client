import { makeAutoObservable, observable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';

type LoginParams = {
  privateKey: string;
  userInfo: UserInfo;
};

type Account = {
  address: string;
  privateKey: string;
  userInfo: UserInfo;
};

export class AccountStore {
  account?: Account;

  constructor() {
    makeAutoObservable(this, {
      account: observable.ref,
    });
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
