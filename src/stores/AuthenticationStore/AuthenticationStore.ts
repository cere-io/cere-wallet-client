import { makeAutoObservable, reaction, when } from 'mobx';
import { LoginOptions } from '@cere-wallet/communication';

import { PopupManagerStore } from '../PopupManagerStore';
import { AccountStore, AccountLoginData } from '../AccountStore';
import { AuthorizePopupState } from '../AuthorizePopupStore';
import { OpenLoginStore, LoginParams, InitParams } from '../OpenLoginStore';
import { AppContextStore } from '../AppContextStore';

export class AuthenticationStore {
  private openLoginStore = new OpenLoginStore();
  private _isRehydrating?: boolean;

  constructor(
    private accountStore: AccountStore,
    private contextStore: AppContextStore,
    private popupManagerStore?: PopupManagerStore,
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

    return this.accountStore.userInfo;
  }

  getRedirectUrl(params: LoginParams = {}) {
    return this.getLoginUrl('redirect', params);
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

    const loginUrl = await this.getLoginUrl('popup', params);
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

    this.popupManagerStore.registerRedirect(modalId, true);
    this.popupManagerStore.showModal(modalId, '/frame');

    const loginUrl = await this.getLoginUrl('modal', params);
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

  private async getLoginUrl(mode: Required<LoginOptions>['uxMode'], params: LoginParams) {
    const preopenInstanceId = params.preopenInstanceId || 'redirect';
    const startUrl = new URL('/authorize', window.origin);
    let callbackUrl = mode === 'redirect' ? '/authorize/redirect' : '/authorize/close';

    if (params.redirectUrl) {
      callbackUrl += `?redirectUrl=${params.redirectUrl}`;
    }

    startUrl.searchParams.append('callbackUrl', callbackUrl);
    startUrl.searchParams.append('preopenInstanceId', preopenInstanceId);

    if (this.openLoginStore.sessionNamespace) {
      startUrl.searchParams.append('sessionNamespace', this.openLoginStore.sessionNamespace);
    }

    return !params.idToken
      ? startUrl.toString()
      : await this.openLoginStore.getLoginUrl({ ...params, preopenInstanceId, redirectUrl: callbackUrl });
  }

  private async syncAccountWithState(state: AuthorizePopupState) {
    if (state.result) {
      this.openLoginStore.syncWithEncodedState(state.result, state.sessionId);
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
