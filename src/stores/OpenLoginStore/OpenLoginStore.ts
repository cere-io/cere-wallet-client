import { makeAutoObservable } from 'mobx';
import OpenLogin, { OPENLOGIN_NETWORK_TYPE, LoginParams as OpenloginLoginParams } from '@toruslabs/openlogin';
import { getIFrameOrigin, AppContext, LoginOptions } from '@cere-wallet/communication';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { reportError } from '~/reporting';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from '../Web3AuthStore';
import { Web3AuthNoModal } from '@web3auth/no-modal';
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { AuthAdapter } from '@web3auth/auth-adapter';

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
  private web3auth: Web3AuthNoModal;
  private authAdapter: AuthAdapter;

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);

    const clientId = OPEN_LOGIN_CLIENT_ID;

    const chainConfig = {
      chainNamespace: CHAIN_NAMESPACES.EIP155,
      chainId: '0x1', // Ethereum Mainnet
      rpcTarget: 'https://rpc.ankr.com/eth',
    };

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig },
    });
    this.web3auth = new Web3AuthNoModal({
      clientId,
      chainConfig,
      privateKeyProvider,
    });

    this.authAdapter = new AuthAdapter({
      adapterSettings: {
        network: OPEN_LOGIN_NETWORK,
        clientId,
        uxMode: 'redirect',
        replaceUrlOnRedirect: false,
        sessionNamespace: this.sessionStore.sessionNamespace,
        loginConfig: {
          jwt: {
            clientId,
            verifier: OPEN_LOGIN_VERIFIER,
            typeOfLogin: 'jwt',
            name: 'Cere',
            jwtParameters: {
              domain: window.origin,
              verifierIdField: 'email',
              isVerifierIdCaseSensitive: false,
            },
          },
        },
        whiteLabel: {
          mode: 'auto',
          appName: 'Cere Wallet',
          logoLight: `${window.origin}/images/logo-light.svg`,
          logoDark: `${window.origin}/images/logo.svg`,
          theme: { primary: '#733BF5' },
        },
      },
    });

    this.web3auth.configureAdapter(this.authAdapter);

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
    // return new URL('/wallet/account', this.openLogin.state.iframeUrl).toString();
    return new URL('https://account.web3auth.io/').toString(); // simplified, no iframe
  }

  configureApp(app?: AppContext['app']) {
    const url = new URL(app?.url || this.appUrl || window.origin);
    const name = app ? app.name || url.hostname : 'Cere Wallet';

    /*    const whiteLabel = {
      ...this.openLogin.state.whiteLabel,
      name,
      url: url.origin,
    };

    this.openLogin._syncState({ whiteLabel });*/
  }

  async getLoginUrl(params: LoginParams = {}) {
    /*    const session = {
      _sessionNamespace: this.openLogin.state.sessionNamespace,
      _loginConfig: this.openLogin.state.loginConfig,
      _whiteLabelData: this.openLogin.state.whiteLabel,
    };

    return this.web3auth.getEncodedLoginUrl({
      ...session,
      ...createLoginParams(loginParams),
    });*/
    console.log('IS CONNECTED?');
    console.log(this.web3auth.connected);
    const url = new URL(params?.redirectUrl || '/', window.origin);

    if (params?.preopenInstanceId) {
      url.searchParams.append('preopenInstanceId', params?.preopenInstanceId);
    } else {
      url.searchParams.append('preopenInstanceId', 'redirect');
    }
    if (!this.web3auth.connected) {
      console.log('REDIRECT URL');
      console.log(JSON.stringify(params));
      console.log(url.toString());

      await this.web3auth.init();
      await this.web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
        loginProvider: 'jwt',
        extraLoginOptions: {
          id_token: params?.idToken,
          domain: window.origin,
          verifierIdField: 'email',
        },
        redirectUrl: url.toString(),
      });
    }
    await this.web3auth.enableMFA();
    await this.web3auth.manageMFA({
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: params?.idToken,
        domain: window.origin,
        verifierIdField: 'email',
      },
      redirectUrl: url.toString(),
    });
    return 'abc';
  }
  async manageMfa(params: LoginParams = {}) {
    /*    const session = {
      _sessionNamespace: this.openLogin.state.sessionNamespace,
      _loginConfig: this.openLogin.state.loginConfig,
      _whiteLabelData: this.openLogin.state.whiteLabel,
    };

    return this.web3auth.getEncodedLoginUrl({
      ...session,
      ...createLoginParams(loginParams),
    });*/
    console.log('IS CONNECTED?');
    console.log(this.web3auth.connected);
    const url = new URL(params?.redirectUrl || '/', window.origin);

    if (params?.preopenInstanceId) {
      url.searchParams.append('preopenInstanceId', params?.preopenInstanceId);
    } else {
      url.searchParams.append('preopenInstanceId', 'redirect');
    }
    if (!this.web3auth.connected) {
      console.log('REDIRECT URL');
      console.log(JSON.stringify(params));
      console.log(url.toString());

      await this.web3auth.init();
      await this.web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
        loginProvider: 'jwt',
        extraLoginOptions: {
          id_token: params?.idToken,
          domain: window.origin,
          verifierIdField: 'email',
        },
        redirectUrl: url.toString(),
      });
    }

    /* await this.web3auth.enableMFA();
    await this.web3auth.manageMFA({
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: params?.idToken,
        domain: window.origin,
        verifierIdField: 'email',
      },
      // redirectUrl: url.toString(),
    });*/
    //return 'abc';
  }

  async login(params?: LoginParams) {
    /*  if (!this.openLogin.provider.initialized) {
      await this.openLogin.init();
    }

*/
    const url = new URL(params?.redirectUrl || '/', window.origin);

    if (params?.preopenInstanceId) {
      url.searchParams.append('preopenInstanceId', params?.preopenInstanceId);
    } else {
      url.searchParams.append('preopenInstanceId', 'redirect');
    }

    console.log('REDIRECT URL');
    console.log(JSON.stringify(params));
    console.log(url.toString());

    if (!this.web3auth.connected) {
      await this.web3auth.init();
    }
    await this.authAdapter.connect({
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: params?.idToken,
        domain: window.origin,
        verifierIdField: 'email',
      },
      redirectUrl: url.toString(),
    });
    /*   await this.web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: params?.idToken,
        domain: window.origin,
        verifierIdField: 'email',
      },
      redirectUrl: url.toString(),
    });
*/
    //await this.web3auth.authenticateUser()
    await new Promise(() => {}); // Never ending promise waiting for the full page redirect
  }

  async isAllowedRedirectUrl(url: string) {
    try {
      const { origin, hostname } = new URL(url);

      if (hostname === 'localhost') {
        return true;
      }

      /*   const whiteList = await this.openLogin.getWhitelist();
      const isAllowed = Object.keys(whiteList).some((url) => new URL(url).origin === origin);

      return isAllowed;*/
      return true;
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
