import { makeAutoObservable, when } from 'mobx';
import OpenLogin from '@toruslabs/openlogin';

import { Wallet } from '../types';
import { PopupManagerStore } from '../PopupManagerStore';
import { AccountStore } from '../AccountStore';
import { AuthorizePopupState } from '../AuthorizePopupStore';

type LoginData = {
  preopenInstanceId?: string;
};

type LoginParams = {
  popupId?: string;
  idToken?: string;
  redirectUrl?: string;
};

const getLoginParams = ({ redirectUrl = '/authorize/done', idToken, popupId }: LoginParams = {}) => {
  const url = new URL(redirectUrl, window.origin);

  if (popupId) {
    url.searchParams.append('popupId', popupId);
  }

  return {
    loginProvider: 'jwt',
    redirectUrl: url.toString(),
    extraLoginOptions: {
      id_token: idToken,
    },
  };
};

export class AuthenticationStore {
  private openLogin: OpenLogin;

  constructor(
    private wallet: Wallet,
    private accountStore: AccountStore,
    private popupManagerStore: PopupManagerStore,
  ) {
    makeAutoObservable(this);

    const clientId = 'BC_ADg9FZiPWIIVeu74NZVOyWtK7oIz3AKI8cfWaxcVzwjIJyEnuRl6TXKYim_mMqsykwLx3WEu3BAUnSD1238k';

    this.openLogin = new OpenLogin({
      network: 'testnet',
      clientId,
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

  async rehydrate() {
    await this.openLogin.init();

    return !!this.syncAccount();
  }

  async login({ preopenInstanceId }: LoginData) {
    if (preopenInstanceId) {
      return await this.loginInPopup(preopenInstanceId);
    }

    return await this.loginWithRedirect();
  }

  async logout() {}

  private getLoginUrl(params: LoginParams) {
    return this.openLogin.getEncodedLoginUrl(getLoginParams(params));
  }

  private async loginInPopup(popupId: string) {
    const loginUrl = await this.getLoginUrl({ popupId });
    const popup = await this.popupManagerStore.proceedTo<AuthorizePopupState>(popupId, loginUrl, {});

    await when(() => !!popup.state.result);

    const jsonResult = Buffer.from(popup.state.result!, 'base64').toString();
    const result = jsonResult && JSON.parse(jsonResult);

    this.popupManagerStore.closePopup(popupId);
    this.openLogin._syncState(result);

    const account = await this.syncAccount();

    if (!account) {
      throw new Error('Something went wrong during authentication');
    }

    return account.address;
  }

  private async loginWithRedirect(): Promise<string> {
    throw new Error('Login with redirect is not yet implemented');
  }

  private async syncAccount() {
    if (!this.openLogin.privKey) {
      await this.accountStore.logout();

      return undefined;
    }

    const userInfo = await this.openLogin.getUserInfo();

    this.accountStore.loginWithPrivateKey({
      privateKey: this.openLogin.privKey,
      userInfo,
    });

    return this.accountStore.account;
  }
}
