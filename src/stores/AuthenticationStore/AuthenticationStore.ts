import { makeAutoObservable, reaction, when } from 'mobx';
import { LoginOptions } from '@cere-wallet/communication';

import { PopupManagerStore } from '../PopupManagerStore';
import { AccountStore, AccountLoginData } from '../AccountStore';
import { AuthorizePopupState } from '../AuthorizePopupStore';
import { OpenLoginStore, LoginParams, InitParams } from '../OpenLoginStore';
import { AppContextStore } from '../AppContextStore';

export type AuthenticationStoreOptions = {
  sessionNamespace?: string;
};

export class AuthenticationStore {
  private _isRehydrating?: boolean;

  constructor(
    private accountStore: AccountStore,
    private contextStore: AppContextStore,
    private openLoginStore: OpenLoginStore,
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

  get isRehydrating() {
    const { user, accounts } = this.accountStore;

    return this._isRehydrating || (user && !accounts.length);
  }

  private set isRehydrating(value) {
    this._isRehydrating = value;
  }

  async rehydrate({ sessionId }: InitParams = {}) {
    this.isRehydrating = true;

    if (this.openLoginStore.sessionId || sessionId) {
      await this.openLoginStore.init({ sessionId });
    }

    await this.syncLoginData();

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

    return this.syncAccountWithState(authPopup.state.result!);
  }

  async loginInModal(modalId: string, params: LoginParams = {}) {
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

    return this.syncAccountWithState(authPopup.state.result!);
  }

  async logout() {
    await this.openLoginStore.logout();
    await this.contextStore.disconnect();
    await this.syncLoginData();

    return true;
  }

  private async getLoginUrl(mode: Required<LoginOptions>['uxMode'], params: LoginParams) {
    const { preopenInstanceId = 'redirect' } = params;
    const { sessionNamespace } = this.openLoginStore;

    const startUrl = new URL('/authorize', window.origin);
    const callbackParams = new URLSearchParams();
    const callbackPath = mode === 'redirect' ? '/authorize/redirect' : '/authorize/close';

    if (params.redirectUrl) {
      callbackParams.append('redirectUrl', params.redirectUrl);
    }

    if (sessionNamespace) {
      callbackParams.append('sessionNamespace', sessionNamespace);
      startUrl.searchParams.append('sessionNamespace', sessionNamespace);
    }

    const callbackQuery = callbackParams.toString();
    const callbackUrl = callbackQuery ? `${callbackPath}?${callbackQuery}` : callbackPath;

    startUrl.searchParams.append('callbackUrl', callbackUrl);
    startUrl.searchParams.append('preopenInstanceId', preopenInstanceId);

    return !params.idToken
      ? startUrl.toString()
      : await this.openLoginStore.getLoginUrl({ ...params, preopenInstanceId, redirectUrl: callbackUrl });
  }

  private async syncAccountWithState({ state, sessionId }: Required<AuthorizePopupState>['result']) {
    if (!state) {
      throw new Error('Authentication state is empty');
    }

    if (!sessionId) {
      console.warn('Ausentication sessionId is empty - will not be possible to restore the session after reload');
    }

    this.openLoginStore.syncWithEncodedState(state, sessionId);

    if (sessionId) {
      await this.openLoginStore.init({ sessionId });
    }

    await this.syncLoginData();

    if (!this.accountStore.privateKey) {
      throw new Error('Something went wrong during authentication');
    }

    await when(() => !!this.accountStore.account); // Wait for accounts to be created from the privateKey

    return this.accountStore.account!.address;
  }

  private async syncLoginData() {
    const { privateKey } = this.openLoginStore;

    this.accountStore.loginData = privateKey
      ? {
          privateKey,
          userInfo: await this.openLoginStore.getUserInfo(),
        }
      : null;
  }
}
