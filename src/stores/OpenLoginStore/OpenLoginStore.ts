import { makeAutoObservable } from 'mobx';
import OpenLogin from '@toruslabs/openlogin';

export class OpenLoginStore {
  private openLogin: OpenLogin;

  constructor() {
    makeAutoObservable(this);

    const clientId = 'BC_ADg9FZiPWIIVeu74NZVOyWtK7oIz3AKI8cfWaxcVzwjIJyEnuRl6TXKYim_mMqsykwLx3WEu3BAUnSD1238k';

    this.openLogin = new OpenLogin({
      network: 'testnet',
      clientId,
      uxMode: 'redirect',
      redirectUrl: `${window.origin}/login/end`,
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

  async init() {
    await this.openLogin.init();
  }

  async login(idToken: string) {
    const { privKey } = await this.openLogin.login({
      loginProvider: 'jwt',
      extraLoginOptions: {
        id_token: idToken,
      },
    });

    return privKey;
  }

  async logout() {
    this.openLogin.logout();
  }

  async getUserinfo() {
    return this.openLogin.getUserInfo();
  }
}
