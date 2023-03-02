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
    private popupManagerStore?: PopupManagerStore,
    private _isRehydrating?: boolean,
  ) {
    makeAutoObservable(this);

    reaction(
      () => this.contextStore.app,
      (app) => {
        this.openLoginStore.configureApp(app);
      },
    );
  }

  get isRehydrating() {
    return this._isRehydrating;
  }

  private set isRehydrating(value) {
    this._isRehydrating = value;
  }

  async rehydrate({ sessionId }: InitParams = {}) {
    this.isRehydrating = true;

    if (this.openLoginStore.sessionId || sessionId) {
      await this.openLoginStore.init({ sessionId });
    }

    await this.syncAccount();

    this.isRehydrating = false;

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

  async login({ redirectUrl, ...params }: LoginParams = {}) {
    const url = await this.getRedirectUrl({
      redirectUrl: redirectUrl || window.location.href,
      ...params,
    });

    window.location.replace(url);
  }

  async loginWithPrivateKey(data: AccountLoginData) {
    this.accountStore.loginData = data;

    return true;
  }

  async loginInPopup(popupId: string, params: LoginParams = {}) {
    if (!this.popupManagerStore) {
      throw new Error('PopupManagerStore dependency was not provided');
    }

    const loginUrl = await this.openLoginStore.getLoginUrl({
      ...params,
      preopenInstanceId: popupId,
      redirectUrl: '/authorize/close',
    });

    const redirect = await this.popupManagerStore.redirect(popupId, loginUrl);
    const authPopup = this.popupManagerStore.registerPopup<AuthorizePopupState>(popupId, {});

    await when(() => !redirect.isConnected || !!authPopup.state.result);
    this.popupManagerStore.closePopup(popupId);

    if (!redirect.isConnected) {
      throw new Error('User has closed the login popup');
    }

    return this.syncAccountWithState(authPopup.state);
  }

  async loginInModal(modalId: string, params: LoginParams = {}): Promise<string> {
    if (!this.popupManagerStore) {
      throw new Error('PopupManagerStore dependency was not provided');
    }

    const authPopup = this.popupManagerStore.registerPopup<AuthorizePopupState>(modalId, {});
    const modal = this.popupManagerStore.registerModal(modalId);

    this.popupManagerStore.registerRedirect(modalId);
    this.popupManagerStore.showModal(modalId, '/frame');

    const loginUrl = await this.openLoginStore.getLoginUrl({
      ...params,
      preopenInstanceId: modalId,
      redirectUrl: '/authorize/close',
    });

    this.popupManagerStore.redirect(modalId, loginUrl);

    await when(() => !!authPopup.state.result || !modal.open);

    if (!modal.open) {
      throw new Error('User has closed the login modal');
    } else {
      this.popupManagerStore.hideModal(modalId);
    }

    return this.syncAccountWithState(authPopup.state);
  }

  async logout() {
    await this.openLoginStore.logout();
    await this.contextStore.disconnect();
    await this.syncAccount();

    return true;
  }

  private async syncAccountWithState(state: AuthorizePopupState) {
    if (state.result) {
      this.openLoginStore.syncWithEncodedState(state.result, state.sessionId);

      await this.openLoginStore.init();
    }

    const account = await this.syncAccount();

    if (!account) {
      throw new Error('Something went wrong during authentication');
    }

    return account.address;
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
