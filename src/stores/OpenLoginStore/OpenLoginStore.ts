import { makeAutoObservable } from 'mobx';
import { randomBytes } from 'crypto';
import OpenLogin, { OPENLOGIN_NETWORK_TYPE, OpenLoginOptions, OpenLoginState } from '@toruslabs/openlogin';
import { getIFrameOrigin, AppContext } from '@cere-wallet/communication';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';

export type LoginParams = {
  preopenInstanceId?: string;
  idToken?: string;
  redirectUrl?: string;
};

export type InitParams = {
  sessionId?: string;
};

export type OpenLoginStoreOptions = Pick<OpenLoginOptions, 'storageKey' | 'uxMode'> & {
  sessionNamespace?: string;
};

const createLoginParams = ({ redirectUrl = '/', idToken, preopenInstanceId }: LoginParams = {}) => {
  const url = new URL(redirectUrl, window.origin);

  if (preopenInstanceId) {
    url.searchParams.append('preopenInstanceId', preopenInstanceId);
  }

  return {
    loginProvider: 'jwt',
    redirectUrl: url.toString(),
    extraLoginOptions: { preopenInstanceId, id_token: idToken },
  };
};

export class OpenLoginStore {
  private openLogin: OpenLogin;
  private initialState: OpenLoginState;

  constructor({ storageKey, sessionNamespace, uxMode }: OpenLoginStoreOptions = {}) {
    makeAutoObservable(this);

    const clientId = OPEN_LOGIN_CLIENT_ID;
    this.openLogin = new OpenLogin({
      clientId,
      storageKey,
      network: OPEN_LOGIN_NETWORK as OPENLOGIN_NETWORK_TYPE,
      no3PC: true,
      uxMode: uxMode || 'redirect',
      replaceUrlOnRedirect: false,
      _sessionNamespace: sessionNamespace || this.appUrl?.hostname,

      whiteLabel: {
        dark: false,
        logoDark: `${window.origin}/images/logo.svg`,
        logoLight: `${window.origin}/images/logo-light.svg`,

        /**
         * TODO: Figure out how to use `UI Kit` theme variables here
         */
        theme: {
          primary: '#733BF5',
        },
      },

      loginConfig: {
        jwt: {
          clientId,
          verifier: OPEN_LOGIN_VERIFIER,
          name: 'Cere',
          typeOfLogin: 'jwt',
          jwtParameters: {
            domain: window.origin,
            verifierIdField: 'email',
            isVerifierIdCaseSensitive: false,
          },
        },
      },
    });

    this.initialState = { ...this.openLogin.state };
    this.configureApp();
  }

  private resetState() {
    this.openLogin.state.store.resetStore();
    this.openLogin.state = { ...this.initialState };
  }

  private get appUrl() {
    try {
      return new URL(getIFrameOrigin());
    } catch {
      return undefined;
    }
  }

  get initialized() {
    return this.openLogin.provider.initialized;
  }

  get sessionNamespace() {
    return this.openLogin.state.sessionNamespace;
  }

  get sessionId() {
    // @ts-ignore
    console.log('Store key', this.openLogin.state.store._storeKey);
    console.log('Store', this.openLogin.state.store.getStore());
    try {
      return this.openLogin.state.store.get('sessionId');
    } catch {
      return undefined;
    }
  }

  get privateKey() {
    return this.openLogin.privKey || null;
  }

  get accountUrl() {
    return new URL('/wallet/account', this.openLogin.state.iframeUrl).toString();
  }

  configureApp(app?: AppContext['app']) {
    const url = new URL(app?.url || this.appUrl || window.origin);
    const name = app ? app.name || url.hostname : 'Cere Wallet';

    const whiteLabel = {
      ...this.openLogin.state.whiteLabel,
      name,
      url: url.origin,
    };

    this.openLogin._syncState({ whiteLabel });
  }

  async getLoginUrl(loginParams: LoginParams = {}) {
    const sessionId = this.sessionId || randomBytes(32).toString('hex');
    const session = {
      _sessionId: sessionId,
      _sessionNamespace: this.openLogin.state.sessionNamespace,
      _loginConfig: this.openLogin.state.loginConfig,
      _whiteLabelData: this.openLogin.state.whiteLabel,
    };

    return this.openLogin.getEncodedLoginUrl({
      ...session,
      ...createLoginParams(loginParams),
    });
  }

  async init({ sessionId }: InitParams = {}) {
    if (this.initialized) {
      return; // Do nothing if already initialized
    }

    if (sessionId) {
      this.openLogin.state.store.set('sessionId', sessionId);
    }

    await this.openLogin.init();
  }

  async login(params?: LoginParams) {
    await this.init();
    await this.openLogin.login(createLoginParams(params));

    await new Promise(() => {}); // Never ending promise waiting for the full page redirect
  }

  async logout() {
    if (!this.openLogin.privKey) {
      return; // Do nothing if not logged in
    }

    if (this.initialized) {
      await this.openLogin.logout();
    }

    this.resetState();
  }

  async getUserInfo() {
    return this.openLogin.getUserInfo();
  }

  async syncWithEncodedState(encodedState: string, sessionId?: string) {
    const jsonResult = Buffer.from(encodedState, 'base64').toString();
    const state = jsonResult && JSON.parse(jsonResult);

    /**
     * Reset the store in case it was not properly inited
     */
    this.openLogin.state.store.resetStore();

    if (sessionId) {
      this.openLogin.state.store.set('sessionId', sessionId);
    }

    this.openLogin._syncState(state);
  }
}
