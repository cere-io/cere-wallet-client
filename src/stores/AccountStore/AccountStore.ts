import { makeAutoObservable } from 'mobx';
import { UserInfo } from '@cere-wallet/communication';
import { Account, KeyPair, KeyType, exportAccountToJson, createAccountFromPair } from '@cere-wallet/wallet-engine';

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

  get isNewUser() {
    return this.loginData?.userInfo.isNewUser;
  }

  get accounts() {
    return this.currentAccounts;
  }

  updateAccounts(keyPairs: KeyPair[]) {
    this.currentAccounts = keyPairs.map((pair, index) =>
      createAccountFromPair(pair, this.user?.name || `Account #${index}`),
    );
  }

  exportAccount(type: KeyType, passphrase?: string) {
    if (!this.privateKey) {
      throw new Error('No private key found!');
    }

    const keyData = exportAccountToJson({ privateKey: this.privateKey, type, passphrase: passphrase || '' });
    const accountBlob = new Blob([JSON.stringify(keyData)], {
      type: 'application/json',
    });

    return URL.createObjectURL(accountBlob);
  }

  getAccount(type: KeyType) {
    return this.accounts.find((account) => account.type === type);
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
    const defaultAccount = this.accounts.at(0);

    return this.accounts.find((account) => account.address === selectedAddress) || defaultAccount;
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
    return this.userInfo;
  }
}
