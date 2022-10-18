import { makeAutoObservable, when } from 'mobx';
import { Wallet } from '../types';
import { PopupManagerStore } from '../PopupManagerStore';
import { AccountStore, AccountLoginData } from '../AccountStore';
import { AuthorizePopupState } from '../AuthorizePopupStore';
import { OpenLoginStore } from '../OpenLoginStore';

type LoginData = {
  preopenInstanceId?: string;
};

export class AuthenticationStore {
  private openLoginStore = new OpenLoginStore();

  constructor(
    private wallet: Wallet,
    private accountStore: AccountStore,
    private popupManagerStore: PopupManagerStore,
  ) {
    makeAutoObservable(this);
  }

  async rehydrate() {
    if (this.openLoginStore.sessionId) {
      await this.openLoginStore.init();
    }

    await this.syncAccount();

    return !!this.accountStore.account;
  }

  async login({ preopenInstanceId }: LoginData) {
    if (preopenInstanceId) {
      await this.loginInPopup(preopenInstanceId);
    } else {
      await this.openLoginStore.login();
    }

    const account = await this.syncAccount();

    if (!account) {
      throw new Error('Something went wrong during authentication');
    }

    return account.address;
  }

  async loginWithPrivateKey(data: AccountLoginData) {
    this.accountStore.loginData = data;

    return true;
  }

  async logout() {
    await this.openLoginStore.logout();

    this.accountStore.loginData = null;

    return true;
  }

  private async loginInPopup(popupId: string) {
    const popup = await this.popupManagerStore.proceedTo<AuthorizePopupState>(popupId, '/authorize/start', {});

    await when(() => !!popup.state.result);

    this.popupManagerStore.closePopup(popupId);
    this.openLoginStore.syncWithEncodedState(popup.state.result!, popup.state.sessionId);
  }

  private async syncAccount() {
    this.accountStore.loginData = this.openLoginStore.privateKey
      ? {
          privateKey: this.openLoginStore.privateKey,
          userInfo: await this.openLoginStore.getUserInfo(),
        }
      : null;

    return this.accountStore.account;
  }
}
