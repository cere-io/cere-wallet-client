import { makeAutoObservable, reaction, when } from 'mobx';
import { LoginOptions } from '@cere-wallet/communication';

import { Wallet } from '../types';
import { PopupManagerStore } from '../PopupManagerStore';
import { AccountStore, AccountLoginData } from '../AccountStore';
import { AuthorizePopupState } from '../AuthorizePopupStore';
import { OpenLoginStore, LoginParams } from '../OpenLoginStore';
import { AppContextStore } from '../AppContextStore';
import { SessionStore } from '../SessionStore';
import { createAuthToken } from './createAuthToken';

export type AuthenticationStoreOptions = {
  sessionNamespace?: string;
};

type RehydrateParams = {
  sessionId?: string;
};

type AuthLoginParams = LoginParams & {
  forceMfa?: boolean;
  emailHint?: string;
};

export class AuthenticationStore {
  private _isRehydrating?: boolean;

  constructor(
    private wallet: Wallet,
    private sessionStore: SessionStore,
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

  async rehydrate({ sessionId }: RehydrateParams = {}) {
    this.isRehydrating = true;

    await this.sessionStore.rehydrate(sessionId);

    this.syncLoginData();
    this.isRehydrating = false;

    return this.accountStore.userInfo;
  }

  getRedirectUrl(params: AuthLoginParams = {}) {
    return this.getLoginUrl('redirect', params);
  }

  async createToken() {
    if (!this.wallet.isReady()) {
      return null;
    }

    return createAuthToken(this.wallet.unsafeProvider.getSigner());
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

  async loginInPopup(popupId: string, params: AuthLoginParams = {}) {
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

    return this.syncAccount(authPopup.state.result!);
  }

  async loginInModal(modalId: string, params: AuthLoginParams = {}) {
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

    return this.syncAccount(authPopup.state.result!);
  }

  async logout() {
    await this.sessionStore.invalidateSession();
    await this.contextStore.disconnect();

    this.syncLoginData();

    return true;
  }

  private async getLoginUrl(mode: Required<LoginOptions>['uxMode'], params: AuthLoginParams) {
    const { preopenInstanceId = 'redirect', forceMfa = false, emailHint } = params;
    const { sessionNamespace } = this.sessionStore;

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

    if (forceMfa) {
      startUrl.searchParams.append('mfa', 'force');
    }

    if (emailHint) {
      startUrl.searchParams.append('email', emailHint);
    }

    const callbackQuery = callbackParams.toString();
    const callbackUrl = callbackQuery ? `${callbackPath}?${callbackQuery}` : callbackPath;

    startUrl.searchParams.append('callbackUrl', callbackUrl);
    startUrl.searchParams.append('preopenInstanceId', preopenInstanceId);

    return !params.idToken
      ? startUrl.toString()
      : await this.openLoginStore.getLoginUrl({ ...params, preopenInstanceId, redirectUrl: callbackUrl });
  }

  private async syncAccount({ sessionId }: Required<AuthorizePopupState>['result']) {
    const session = await this.sessionStore.rehydrate(sessionId, { store: true });

    if (!session) {
      throw new Error('Something went wrong during authentication');
    }

    this.syncLoginData();

    await when(() => !!this.accountStore.account); // Wait for accounts to be created from the privateKey

    return this.accountStore.account!.address;
  }

  private syncLoginData() {
    const { session } = this.sessionStore;

    this.accountStore.loginData = session;
  }
}
