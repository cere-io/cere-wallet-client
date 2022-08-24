import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccountAddress } from '@cere-wallet/wallet-engine';
import { createSharedState } from '../sharedState';

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
  private shared = createSharedState<SharedState>(`account.${this.instanceId}`, {});

  constructor(private instanceId: string) {
    makeAutoObservable(this);
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
