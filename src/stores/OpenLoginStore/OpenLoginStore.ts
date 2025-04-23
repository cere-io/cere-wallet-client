import { makeAutoObservable } from 'mobx';
import { getIFrameOrigin, AppContext, LoginOptions } from '@cere-wallet/communication';

import { reportError } from '~/reporting';
import { SessionStore } from '../SessionStore';
import { getScopedKey } from '../Web3AuthStore';

export type LoginParams = LoginOptions & {
  preopenInstanceId?: string;
};

export class OpenLoginStore {
  constructor(private sessionStore: SessionStore) {
    makeAutoObservable(this);
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
    // This functionality is now handled by CustomAuth
  }

  async getLoginUrl(loginParams: LoginParams = {}) {
    // In the new implementation, redirect URLs are handled differently
    return '';
  }

  async login(params?: LoginParams) {
    // This method redirects to the login page
    window.location.href = `${window.origin}/login`;
    // Return a dummy promise - this will never actually return since we're redirecting
    return Promise.resolve();
  }

  async isAllowedRedirectUrl(url: string) {
    try {
      const { hostname } = new URL(url);

      if (hostname === 'localhost') {
        return true;
      }

      // Simple whitelist check
      return true;
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
