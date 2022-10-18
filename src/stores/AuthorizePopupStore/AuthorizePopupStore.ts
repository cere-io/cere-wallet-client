import { createSharedPopupState } from '../sharedState';
import { OpenLoginStore } from '../OpenLoginStore';

export type AuthorizePopupState = {
  result?: string;
  sessionId?: string;
};

export class AuthorizePopupStore {
  private openLoginStore = new OpenLoginStore();
  private shared = createSharedPopupState<AuthorizePopupState>(this.preopenInstanceId, {});

  constructor(public readonly preopenInstanceId: string) {}

  async start() {
    await this.openLoginStore.init();
    await this.openLoginStore.login({
      preopenInstanceId: this.preopenInstanceId,
      redirectUrl: '/authorize/end',
    });
  }

  async end({ result, sessionId }: AuthorizePopupState) {
    this.shared.state.result = result;
    this.shared.state.sessionId = sessionId;
  }
}
