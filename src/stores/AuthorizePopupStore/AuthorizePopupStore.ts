import { OpenLoginStore } from '../OpenLoginStore';
import { createSharedPopupState } from '../sharedState';

export type AuthorizePopupState = {
  result?: string;
  sessionId?: string;
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

  async acceptResult({ result, sessionId }: AuthorizePopupState) {
    this.shared.state.result = result;
    this.shared.state.sessionId = sessionId;
  }
}
