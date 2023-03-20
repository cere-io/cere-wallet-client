import { makeAutoObservable, when } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { getAccount } from '@cere-wallet/wallet-engine';

import { User, Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { ApplicationsStore } from '../ApplicationsStore';

export type AccountLoginData = {
  privateKey: string;
  userInfo: Omit<UserInfo, 'isNewUser'>;
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

  constructor(private wallet: Wallet, private applicationsStore: ApplicationsStore) {
    makeAutoObservable(this);
  }

  set loginData(loginData: AccountLoginData | null) {
    this.shared.state.loginData = loginData;
  }

  get loginData() {
    return this.shared.state.loginData;
  }

  get accounts() {
    const { user, privateKey } = this;

    if (!user || !privateKey) {
      return [];
    }

    return [
      getAccount({ type: 'ethereum', name: user.name, privateKey }),
      getAccount({ type: 'ed25519', name: user.name, privateKey }),
    ];
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

  get userInfo(): UserInfo | undefined {
    return !this.loginData
      ? undefined
      : {
          ...this.loginData.userInfo,
          isNewUser: this.applicationsStore.isNewUser,
        };
  }

  get privateKey() {
    return this.loginData?.privateKey;
  }

  async getUserInfo() {
    await when(() => this.applicationsStore.isNewUser !== undefined);

    return this.userInfo;
  }
}
