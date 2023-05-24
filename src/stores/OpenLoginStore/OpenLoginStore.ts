import { makeAutoObservable } from 'mobx';
import OpenLogin, { OPENLOGIN_NETWORK_TYPE } from '@toruslabs/openlogin';
import { getIFrameOrigin, AppContext } from '@cere-wallet/communication';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from '../Web3AuthStore';

export type LoginParams = {
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
    extraLoginOptions: { preopenInstanceId, id_token: idToken },
  };
};

export class OpenLoginStore {
  private openLogin: OpenLogin;

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);

    const clientId = OPEN_LOGIN_CLIENT_ID;
    this.openLogin = new OpenLogin({
      clientId,
      network: OPEN_LOGIN_NETWORK as OPENLOGIN_NETWORK_TYPE,
      no3PC: true,
      uxMode: 'sessionless_redirect',
      replaceUrlOnRedirect: false,
      _sessionNamespace: this.sessionStore.sessionNamespace,

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

    this.configureApp();
  }

  private get appUrl() {
    try {
      return new URL(getIFrameOrigin());
    } catch {
      return undefined;
    }
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
    const session = {
      _sessionNamespace: this.openLogin.state.sessionNamespace,
      _loginConfig: this.openLogin.state.loginConfig,
      _whiteLabelData: this.openLogin.state.whiteLabel,
    };

    return this.openLogin.getEncodedLoginUrl({
      ...session,
      ...createLoginParams(loginParams),
    });
  }

  async login(params?: LoginParams) {
    if (!this.openLogin.provider.initialized) {
      await this.openLogin.init();
    }

    await this.openLogin.login(createLoginParams(params));

    await new Promise(() => {}); // Never ending promise waiting for the full page redirect
  }

  async isAllowedRedirectUrl(url: string) {
    try {
      const { origin, hostname } = new URL(url);

      if (hostname === 'localhost') {
        return true;
      }

      const whiteList = await this.openLogin.getWhitelist();
      const isAllowed = Object.keys(whiteList).some((url) => new URL(url).origin === origin);

      return isAllowed;
    } catch (error) {
      console.error(error);

      return false;
    }
  }

  async acceptEncodedState(encodedState: string) {
    const jsonResult = Buffer.from(encodedState, 'base64').toString();
    const { coreKitKey, store } = jsonResult && JSON.parse(jsonResult);

    return this.sessionStore.createSession({
      privateKey: getScopedKey(coreKitKey),
      userInfo: {
        email: store.email || '',
        name: store.name || '',
        profileImage: store.profileImage || '',
        typeOfLogin: store.typeOfLogin || '',
        verifier: store.verifier || '',
        verifierId: store.verifierId || '',
      },
    });
  }
}
