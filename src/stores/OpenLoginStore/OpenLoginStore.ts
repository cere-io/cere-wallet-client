import { makeAutoObservable } from 'mobx';
import { randomBytes } from 'crypto';
import OpenLogin, { OPENLOGIN_NETWORK_TYPE, OpenLoginOptions } from '@toruslabs/openlogin';
import { getIFrameOrigin } from '@cere-wallet/communication';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';

type LoginParams = {
  preopenInstanceId?: string;
  idToken?: string;
  redirectUrl?: string;
};

const createLoginParams = ({ redirectUrl = '/', idToken, preopenInstanceId }: LoginParams = {}) => {
  const url = new URL(redirectUrl, window.origin);

  if (preopenInstanceId) {
    url.searchParams.append('preopenInstanceId', preopenInstanceId);
  }

  return {
    loginProvider: 'jwt',
    redirectUrl: url.toString(),
    extraLoginOptions: {
      id_token: idToken,
    },
  };
};

export class OpenLoginStore {
  private openLogin: OpenLogin;

  constructor(options: Pick<OpenLoginOptions, 'storageKey'> = {}) {
    makeAutoObservable(this);

    const clientId = OPEN_LOGIN_CLIENT_ID;

    this.openLogin = new OpenLogin({
      clientId,
      network: OPEN_LOGIN_NETWORK as OPENLOGIN_NETWORK_TYPE,
      no3PC: true,
      uxMode: 'redirect',
      replaceUrlOnRedirect: false,
      _sessionNamespace: this.sessionNamespace,
      ...options,

      loginConfig: {
        jwt: {
          clientId,
          verifier: OPEN_LOGIN_VERIFIER,
          name: 'Cere',
          typeOfLogin: 'jwt',
          jwtParameters: {
            client_id: clientId,
            domain: window.origin,
            verifierIdField: 'email',
            isVerifierIdCaseSensitive: false,
          },
        },
      },
    });
  }

  get sessionNamespace() {
    try {
      return new URL(getIFrameOrigin()).hostname;
    } catch {
      return undefined;
    }
  }

  get sessionId() {
    return this.openLogin.state.store.get('sessionId');
  }

  get privateKey() {
    return this.openLogin.privKey;
  }

  async getLoginUrl(loginParams: LoginParams = {}) {
    const sessionId = this.sessionId || randomBytes(32).toString('hex');
    const session = {
      _sessionNamespace: this.openLogin.state.sessionNamespace,
      _loginConfig: this.openLogin.state.loginConfig,
      _sessionId: sessionId,
    };

    return this.openLogin.getEncodedLoginUrl({
      ...session,
      ...createLoginParams(loginParams),
    });
  }

  async init() {
    if (this.openLogin.provider.initialized) {
      return; // Do nothing if already initialized
    }

    await this.openLogin.init();
  }

  async login(params?: LoginParams) {
    await this.init();
    await this.openLogin.login(createLoginParams(params));
  }

  async logout() {
    if (!this.openLogin.privKey) {
      return; // Do nothing if not logged in
    }

    await this.openLogin.logout();
    this.openLogin.state.store.resetStore();
  }

  async getUserInfo() {
    return this.openLogin.getUserInfo();
  }

  async syncWithEncodedState(encodedState: string, sessionId?: string) {
    const jsonResult = Buffer.from(encodedState, 'base64').toString();
    const state = jsonResult && JSON.parse(jsonResult);

    if (sessionId) {
      this.openLogin.state.store.set('sessionId', sessionId);
    }

    this.openLogin._syncState(state);
  }
}
