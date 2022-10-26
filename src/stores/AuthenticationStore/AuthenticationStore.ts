import { makeAutoObservable, reaction, when } from 'mobx';

import { PopupManagerStore } from '../PopupManagerStore';
import { AccountStore, AccountLoginData } from '../AccountStore';
import { AuthorizePopupState } from '../AuthorizePopupStore';
import { OpenLoginStore, LoginParams, InitParams } from '../OpenLoginStore';
import { AppContextStore } from '../AppContextStore';

export class AuthenticationStore {
  private openLoginStore = new OpenLoginStore();

  constructor(
    private accountStore: AccountStore,
    private contextStore: AppContextStore,
    private popupManagerStore: PopupManagerStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.contextStore.app,
      (app) => {
        this.openLoginStore.configureApp(app);
      },
    );
  }

  async rehydrate({ sessionId }: InitParams = {}) {
    if (this.openLoginStore.sessionId || sessionId) {
      await this.openLoginStore.init({ sessionId });
    }

    await this.syncAccount();

    return !!this.accountStore.account;
  }

  getRedirectUrl({ redirectUrl, ...params }: LoginParams = {}) {
    const url = new URL('/authorize/redirect', window.origin);

    if (redirectUrl) {
      url.searchParams.append('redirectUrl', redirectUrl);
    }

    return this.openLoginStore.getLoginUrl({
      ...params,
      redirectUrl: url.toString(),
    });
  }

  async loginWithPrivateKey(data: AccountLoginData) {
    this.accountStore.loginData = data;

    return true;
  }

  async loginInPopup(popupId: string, params: LoginParams = {}) {
    const loginUrl = await this.openLoginStore.getLoginUrl({
      ...params,
      preopenInstanceId: popupId,
      redirectUrl: '/authorize/close',
    });

    const redirect = await this.popupManagerStore.redirect(popupId, loginUrl);
    const closePopup = this.popupManagerStore.registerPopup<AuthorizePopupState>(popupId, {});

    await Promise.race([when(() => !redirect.isConnected), when(() => !!closePopup.state.result)]);
    this.popupManagerStore.closePopup(popupId);

    if (!redirect.isConnected) {
      throw new Error('User has closed the login popup');
    }

    if (closePopup.state.result) {
      this.openLoginStore.syncWithEncodedState(closePopup.state.result, closePopup.state.sessionId);

      await this.openLoginStore.init();
    }

    const account = await this.syncAccount();

    if (!account) {
      throw new Error('Something went wrong during authentication');
    }

    return account.address;
  }

  async logout() {
    await this.openLoginStore.logout();

    this.accountStore.loginData = null;

    return true;
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
