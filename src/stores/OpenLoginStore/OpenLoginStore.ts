import { makeAutoObservable } from 'mobx';
import OpenLogin, { OPENLOGIN_NETWORK_TYPE, LoginParams as OpenloginLoginParams } from '@toruslabs/openlogin';
import { getIFrameOrigin, AppContext, LoginOptions } from '@cere-wallet/communication';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { reportError } from '~/reporting';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from '../Web3AuthStore';
import { Auth } from '@web3auth/auth';

export type LoginParams = LoginOptions & {
  preopenInstanceId?: string;
};

const createLoginParams = ({
  redirectUrl = '/',
  idToken,
  preopenInstanceId,
}: LoginParams = {}): OpenloginLoginParams => {
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
  private openLogin: Auth;

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);

    const clientId = OPEN_LOGIN_CLIENT_ID;
    this.openLogin = new Auth({
      clientId,
      network: OPEN_LOGIN_NETWORK,
      uxMode: 'redirect',
      replaceUrlOnRedirect: false,
      sessionNamespace: this.sessionStore.sessionNamespace,

      whiteLabel: {
        mode: 'auto',
        logoDark: `${window.origin}/images/logo.svg`,
        logoLight: `${window.origin}/images/logo-light.svg`,

        /**
         * TODO: Figure out how to use `UI Kit` theme variables here
         */
        theme: {
          primary: '#733BF5',
        },
      },
      mfaSettings: {

      },

      authConnectionConfig: [
        {
          clientId,
          authConnectionId: OPEN_LOGIN_VERIFIER,
          name: 'Cere',
          authConnection: 'custom',
          jwtParameters: {
            domain: window.origin,
            verifierIdField: 'email',
            isVerifierIdCaseSensitive: false,
          },
        },
      ],
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
    return new URL('/wallet/account', this.openLogin.baseUrl).toString();
  }

  configureApp(app?: AppContext['app']) {
    const url = new URL(app?.url || this.appUrl || window.origin);
    const name = app ? app.name || url.hostname : 'Cere Wallet';

    const whiteLabel = {
      //...this.openLogin.state.whiteLabel,
      name,
      url: url.origin,
    };
    ///this.openLogin.getUserInfo()
    //this.openLogin._syncState({ whiteLabel });
  }

  async getLoginUrl(loginParams: LoginParams = {}) {
    return this.openLogin.baseUrl;
  }

  async login(params?: LoginParams) {
    // if (!this.openLoginprovider.initialized) {
    await this.openLogin.init();
    //}

    /*
      loginProvider: 'jwt',
    redirectUrl: url.toString(),
    extraLoginOptions: { preopenInstanceId, id_token: idToken },
     */
    const url = new URL(params?.redirectUrl || '/', window.origin);

    if (params?.preopenInstanceId) {
      url.searchParams.append('preopenInstanceId', params?.preopenInstanceId);
    }

    await this.openLogin.login({
      authConnection: 'custom',
      dappUrl: url.toString(),
      extraLoginOptions: { id_token: params!.idToken },
    });

    await new Promise(() => {}); // Never ending promise waiting for the full page redirect
  }

  async isAllowedRedirectUrl(url: string) {
    try {
      const { origin, hostname } = new URL(url);

      if (hostname === 'localhost') {
        return true;
      }

      //const whiteList = await this.openLogin.getWhitelist();
      const isAllowed = true; //Object.keys(whiteList).some((url) => new URL(url).origin === origin);

      return isAllowed;
    } catch (error) {
      reportError(error);

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
