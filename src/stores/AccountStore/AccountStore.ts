import { makeAutoObservable, when } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { Account, KeyPair } from '@cere-wallet/wallet-engine';

import { User, Wallet } from '../types';
import { createSharedState } from '../sharedState';

export type AccountLoginData = {
  privateKey: string;
  userInfo: UserInfo;
};

type SharedState = {
  selectedAddress?: string;
  loginData: AccountLoginData | null;
};

export class AccountStore {
  private shared = createSharedState<SharedState>(
    `account.${this.wallet.instanceId}`,
    { loginData: null },
    { readOnly: !this.wallet.isRoot() },
  );

  private currentAccounts: Account[] = [];

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
  }

  set loginData(loginData: AccountLoginData | null) {
    this.shared.state.loginData = loginData;
  }

  get loginData() {
    return this.shared.state.loginData;
  }

  set isNewUser(isNewUser: boolean | undefined) {
    if (!this.loginData) {
      return;
    }

    this.loginData.userInfo.isNewUser = isNewUser;
  }

  get isNewUser() {
    return this.loginData?.userInfo.isNewUser;
  }

  get accounts() {
    return this.currentAccounts;
  }

  updateAccounts(accounts: Account[]) {
    this.currentAccounts = accounts;
  }

  mapAccounts(pairs: KeyPair[]) {
    return pairs.map<Account>(({ address, type }, index) => ({
      address,
      type,
      name: this.user?.name || `Account #${index}`,
    }));
  }

  /**
   * Currently it always returns `ethereum` account since we have many places which relies on the account to be `ethereum`
   *
   * TODO: Refactor this property related logic to use single account property instead of two: `account` and `selectedAccount`
   */
  get account() {
    return this.accounts.find(({ type }) => type === 'ethereum');
  }

  get selectedAccount() {
    const selectedAddress = this.shared.state.selectedAddress;

    return this.accounts.find((account) => account.address === selectedAddress) || this.accounts.at(0);
  }

  selectAccount(address: string) {
    this.shared.state.selectedAddress = address;
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
    return this.loginData ? this.loginData.userInfo : undefined;
  }

  get privateKey() {
    return this.loginData?.privateKey;
  }

  async getUserInfo() {
    await when(() => this.isNewUser !== undefined);

    return this.userInfo;
  }
}
