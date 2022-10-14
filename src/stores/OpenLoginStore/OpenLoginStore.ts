import { makeAutoObservable } from 'mobx';
import OpenLogin from '@toruslabs/openlogin';

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

  constructor() {
    makeAutoObservable(this);

    const clientId = 'BC_ADg9FZiPWIIVeu74NZVOyWtK7oIz3AKI8cfWaxcVzwjIJyEnuRl6TXKYim_mMqsykwLx3WEu3BAUnSD1238k';

    this.openLogin = new OpenLogin({
      clientId,
      network: 'testnet',
      uxMode: 'redirect',
      replaceUrlOnRedirect: false,
      loginConfig: {
        jwt: {
          clientId,
          verifier: 'cere-wallet-dev',
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

  get privateKey() {
    return this.openLogin.privKey;
  }

  async init() {
    await this.openLogin.init();
  }

  async login(params?: LoginParams) {
    await this.openLogin.login(createLoginParams(params));
  }

  async logout() {
    await this.openLogin.logout();
  }

  async getUserInfo() {
    return this.openLogin.getUserInfo();
  }

  syncWithEncodedState(encodedState: string) {
    const jsonResult = Buffer.from(encodedState, 'base64').toString();
    const state = jsonResult && JSON.parse(jsonResult);

    this.openLogin._syncState(state);
  }
}
