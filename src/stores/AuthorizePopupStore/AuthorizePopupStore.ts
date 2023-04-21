import { OpenLoginStore } from '../OpenLoginStore';
import { createSharedPopupState } from '../sharedState';

type AuthenticationResult = {
  state: string;
  sessionId: string;
};

export type AuthorizePopupState = {
  result?: AuthenticationResult;
};

export class AuthorizePopupStore {
  private shared = createSharedPopupState<AuthorizePopupState>(this.preopenInstanceId, {});
  private openLoginStore = new OpenLoginStore({
    uxMode: 'sessionless_redirect',
    sessionNamespace: this.sessionNamespace,
  });

  constructor(
    public readonly preopenInstanceId: string,
    private redirectUrl: string,
    private sessionNamespace?: string,
  ) {}

  async login(idToken: string) {
    return this.openLoginStore.login({
      idToken,
      preopenInstanceId: this.preopenInstanceId,
      redirectUrl: this.redirectUrl,
    });
  }

  async acceptResult(result: AuthenticationResult) {
    this.shared.state.result = result;
  }
}
