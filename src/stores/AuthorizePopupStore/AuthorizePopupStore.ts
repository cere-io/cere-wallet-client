import { runInAction } from 'mobx';
import { OpenLoginStore } from '../OpenLoginStore';
import { SessionStore } from '../SessionStore';
import { Web3AuthStore } from '../Web3AuthStore';
import { createSharedPopupState } from '../sharedState';

type AuthenticationResult = {
  sessionId: string;
};

export type AuthorizePopupState = {
  result?: AuthenticationResult;
};

export class AuthorizePopupStore {
  private shared = createSharedPopupState<AuthorizePopupState>(this.preopenInstanceId, {});

  private sessionStore = new SessionStore({
    sessionNamespace: this.sessionNamespace,
  });

  private openLoginStore = new OpenLoginStore({
    uxMode: 'sessionless_redirect',
    sessionNamespace: this.sessionNamespace,
  });

  private web3AuthStore = new Web3AuthStore(this.sessionStore);

  constructor(
    public readonly preopenInstanceId: string,
    private redirectUrl: string,
    private sessionNamespace?: string,
  ) {}

  async login(idToken: string) {
    try {
      await this.web3AuthStore.login({ idToken });
    } catch {
      /**
       * Fallback to OpenLogin authentication for users with 2fa enabled
       */
      await this.openLoginStore.login({
        idToken,
        preopenInstanceId: this.preopenInstanceId,
        redirectUrl: this.redirectUrl,
      });
    }

    this.acceptSession(this.sessionStore.sessionId);
  }

  acceptEncodedState(sessionId: string, encodedState: string) {}

  acceptSession(sessionId: string) {
    runInAction(() => {
      this.shared.state.result = { sessionId };
    });
  }
}
