import { runInAction } from 'mobx';
import { OpenLoginStore } from '../OpenLoginStore';
import { SessionStore } from '../SessionStore';
import { Web3AuthStore } from '../Web3AuthStore';
import { createSharedPopupState } from '../sharedState';
import { createRedirectUrl } from './createRedirectUrl';

type AuthenticationResult = {
  sessionId: string;
};

export type AuthorizePopupStoreOptions = {
  callbackUrl: string;
  redirectUrl?: string;
  forceMfa?: boolean;
  sessionNamespace?: string;
};

export type AuthorizePopupState = {
  result?: AuthenticationResult;
};

export class AuthorizePopupStore {
  private shared = createSharedPopupState<AuthorizePopupState>(this.preopenInstanceId, {});

  private sessionStore = new SessionStore({
    sessionNamespace: this.options.sessionNamespace,
  });

  private openLoginStore = new OpenLoginStore(this.sessionStore);
  private web3AuthStore = new Web3AuthStore(this.sessionStore);

  private redirectUrl: string | null = null;

  constructor(public readonly preopenInstanceId: string, private options: AuthorizePopupStoreOptions) {
    const callbackUrl = new URL(this.options.callbackUrl, window.origin);

    this.redirectUrl = options.redirectUrl || callbackUrl.searchParams.get('redirectUrl');
  }

  async login(idToken: string) {
    try {
      if (this.options.forceMfa) {
        throw new Error('MFA is forced'); // Manually trigger catch block
      }

      await this.web3AuthStore.login({ idToken });
    } catch {
      /**
       * Fallback to OpenLogin authentication for users with 2fa enabled
       */
      await this.openLoginStore.login({
        idToken,
        preopenInstanceId: this.preopenInstanceId,
        redirectUrl: this.options.callbackUrl,
      });
    }

    await this.acceptSession();
  }

  private async validateRedirectUrl(url: string) {
    const isValid = await this.openLoginStore.isAllowedRedirectUrl(url);

    if (!isValid) {
      throw new Error('The redirect url is not allowed');
    }
  }

  async acceptEncodedState(encodedState: string) {
    await this.openLoginStore.acceptEncodedState(encodedState);

    await this.acceptSession();
  }

  private async acceptSession() {
    runInAction(() => {
      this.shared.state.result = {
        sessionId: this.sessionStore.sessionId,
      };
    });

    if (!this.redirectUrl) {
      return;
    }

    await this.validateRedirectUrl(this.redirectUrl);
    await this.sessionStore.storeSession();

    window.location.replace(createRedirectUrl(this.redirectUrl, this.sessionStore.sessionId));

    return new Promise<void>(() => {});
  }
}
