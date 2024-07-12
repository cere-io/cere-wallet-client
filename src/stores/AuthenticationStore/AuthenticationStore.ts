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
import { ApplicationsStore } from '../ApplicationsStore';

export type AuthenticationStoreOptions = {
  sessionNamespace?: string;
};

type RehydrateParams = {
  sessionId?: string;
};

type AuthLoginParams = LoginParams & {
  forceMfa?: boolean;
  emailHint?: string;
  skipIntro?: boolean;
  callbackUrl?: string;
};

export class AuthenticationStore {
  private _isRehydrating?: boolean;

  constructor(
    private wallet: Wallet,
    private sessionStore: SessionStore,
    private accountStore: AccountStore,
    private applicationsStore: ApplicationsStore,
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
    const session = await this.sessionStore.rehydrate(sessionId);

    if (session) {
      await this.applicationsStore.loadConnectedApp(session);
    }

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

  async loginInPopup(preopenInstanceId: string, { permissions, loginHint, ...params }: AuthLoginParams = {}) {
    if (!this.popupManagerStore) {
      throw new Error('PopupManagerStore dependency was not provided');
    }

    const loginUrl = await this.getLoginUrl('popup', { ...params, preopenInstanceId });
    const redirect = await this.popupManagerStore.redirect(preopenInstanceId, loginUrl);
    const authPopup = this.popupManagerStore.registerPopup<AuthorizePopupState>(preopenInstanceId, {
      permissions,
      loginHint,
    });

    await when(() => !redirect.isConnected || !!authPopup.state.result);
    this.popupManagerStore.closePopup(preopenInstanceId);

    if (!redirect.isConnected) {
      throw new Error('User has closed the login popup');
    }

    return this.syncAccount(authPopup.state.result!);
  }

  async loginInModal(preopenInstanceId: string, { permissions, loginHint, ...params }: AuthLoginParams = {}) {
    if (!this.popupManagerStore) {
      throw new Error('PopupManagerStore dependency was not provided');
    }

    const modal = this.popupManagerStore.registerModal(preopenInstanceId);
    const authPopup = this.popupManagerStore.registerPopup<AuthorizePopupState>(preopenInstanceId, {
      permissions,
      loginHint,
    });

    this.popupManagerStore.registerRedirect(preopenInstanceId, true);
    this.popupManagerStore.showModal(preopenInstanceId, '/frame');

    const loginUrl = await this.getLoginUrl('modal', { ...params, preopenInstanceId });
    await this.popupManagerStore.redirect(preopenInstanceId, loginUrl);

    await when(() => !!authPopup.state.result || !modal.open);

    if (!modal.open) {
      throw new Error('User has closed the login modal');
    } else {
      this.popupManagerStore.hideModal(preopenInstanceId);
    }

    return this.syncAccount(authPopup.state.result!);
  }

  async logout() {
    await this.sessionStore.invalidateSession();
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

    if (params.skipIntro) {
      startUrl.searchParams.append('skipIntro', 'yes');
    }

    const callbackQuery = callbackParams.toString();
    const callbackUrl = callbackQuery ? `${callbackPath}?${callbackQuery}` : callbackPath;

    startUrl.searchParams.append('callbackUrl', params.callbackUrl || callbackUrl);
    startUrl.searchParams.append('preopenInstanceId', preopenInstanceId);

    return !params.idToken
      ? startUrl.toString()
      : await this.openLoginStore.getLoginUrl({
          ...params,
          preopenInstanceId,
          redirectUrl: params.callbackUrl || callbackUrl,
        });
  }

  private async syncAccount({ sessionId, permissions }: Required<AuthorizePopupState>['result']) {
    const session = await this.sessionStore.rehydrate(sessionId);

    if (!session) {
      throw new Error('Something went wrong during authentication');
    }

    this.syncLoginData();
    await when(() => !!this.accountStore.account); // Wait for accounts to be created from the privateKey
    await this.applicationsStore.saveApplication({ permissions });

    return this.accountStore.account!.address;
  }

  private syncLoginData() {
    const { session } = this.sessionStore;

    this.accountStore.loginData = session;
  }
}
