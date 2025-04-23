import { makeAutoObservable } from 'mobx';
import { getIFrameOrigin, AppContext, LoginOptions } from '@cere-wallet/communication';
import OpenLogin from '@toruslabs/openlogin';

import { OPEN_LOGIN_CLIENT_ID, OPEN_LOGIN_NETWORK, OPEN_LOGIN_VERIFIER } from '~/constants';
import { reportError } from '~/reporting';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from '../Web3AuthStore';

export type LoginParams = LoginOptions & {
  preopenInstanceId?: string;
};

export class OpenLoginStore {
  private openLogin: OpenLogin;

  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);

    // Инициализируем OpenLogin клиент
    const clientId = OPEN_LOGIN_CLIENT_ID;
    this.openLogin = new OpenLogin({
      clientId,
      network: OPEN_LOGIN_NETWORK,
      uxMode: 'redirect',
      replaceUrlOnRedirect: false,
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
    return `${window.origin}/wallet/account`;
  }

  configureApp(app?: AppContext['app']) {
    // Настройка приложения теперь обрабатывается Web3Auth/CustomAuth
  }

  async getLoginUrl(loginParams: LoginParams = {}) {
    // В новой реализации URL для редиректа обрабатывается иначе
    return '';
  }

  async login(params?: LoginParams) {
    // Этот метод перенаправляет на страницу входа
    window.location.href = `${window.origin}/login`;
    // Возвращаем фиктивный промис - он никогда не вернется, так как происходит редирект
    return Promise.resolve();
  }

  async isAllowedRedirectUrl(url: string) {
    try {
      const { hostname } = new URL(url);

      if (hostname === 'localhost') {
        return true;
      }

      // Список разрешенных доменов
      const whitelistedDomains = [
        // Cere domains
        'cere.network',
        'cere.io',
        'dev.cere.network',
        'stage.cere.network',
        'dev.cere.io',
        'stage.cere.io',
        'console.cere.network',
        'developer.cere.network',
        'stage.developer.cere.network',
        'dev.developer.cere.network',
        'devnet.cere.network',
        'testnet.cere.network',
        'freeport.cere.network',
        'stage.freeport.cere.network',
        'dev.freeport.cere.network',
        'cere-game-portal.cere.network',
        'stage.cere-game-portal.cere.network',
        'dev.cere-game-portal.cere.network',
        // Добавьте домены партнеров при необходимости
      ];

      // Проверяем, принадлежит ли домен к локальному whitelist
      for (const domain of whitelistedDomains) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return true;
        }
      }

      // Если не нашли совпадений - запрещаем редирект
      return false;
    } catch (error) {
      reportError(error);
      return false;
    }
  }

  async acceptEncodedState(encodedState: string) {
    try {
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
    } catch (error) {
      console.error('Error accepting encoded state:', error);
      throw error;
    }
  }
}
