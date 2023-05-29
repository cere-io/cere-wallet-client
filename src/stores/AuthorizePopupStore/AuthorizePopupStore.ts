import { makeAutoObservable, reaction } from 'mobx';
import { OpenLoginStore } from '../OpenLoginStore';
import { SessionStore } from '../SessionStore';
import { Web3AuthStore } from '../Web3AuthStore';
import { createSharedPopupState } from '../sharedState';
import { createRedirectUrl } from './createRedirectUrl';
import reporting from '~/reporting';

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
  private currentEmail?: string;
  private mfaCheckPromise?: Promise<boolean>;

  constructor(public readonly preopenInstanceId: string, private options: AuthorizePopupStoreOptions) {
    makeAutoObservable(this);

    const callbackUrl = new URL(this.options.callbackUrl, window.origin);
    this.redirectUrl = options.redirectUrl || callbackUrl.searchParams.get('redirectUrl');

    reaction(
      () => this.email,
      (verifierId) => {
        this.mfaCheckPromise =
          verifierId && !this.options.forceMfa ? this.web3AuthStore.isMfaEnabled({ verifierId }) : undefined;
      },
    );
  }

  get email() {
    return this.currentEmail;
  }

  set email(email) {
    this.currentEmail = email;
  }

  async login(idToken: string) {
    const isMfa = await this.mfaCheckPromise?.catch((error) => {
      reporting.error(error);

      return undefined; // Mark `isMfa` as undefined to check again later
    });

    if (isMfa || this.options.forceMfa) {
      /**
       * Fallback to OpenLogin authentication for users with MFA enabled
       */
      return this.openLoginStore.login({
        idToken,
        preopenInstanceId: this.preopenInstanceId,
        redirectUrl: this.options.callbackUrl,
      });
    } else {
      await this.web3AuthStore.login({ idToken, checkMfa: isMfa === undefined });
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
    this.shared.state.result = {
      sessionId: this.sessionStore.sessionId,
    };

    if (!this.redirectUrl) {
      return;
    }

    await this.validateRedirectUrl(this.redirectUrl);
    await this.sessionStore.storeSession();

    window.location.replace(createRedirectUrl(this.redirectUrl, this.sessionStore.sessionId));

    return new Promise<void>(() => {});
  }
}
