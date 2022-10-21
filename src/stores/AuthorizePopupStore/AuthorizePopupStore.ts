import { createSharedPopupState } from '../sharedState';

export type AuthorizePopupState = {
  result?: string;
  sessionId?: string;
};

export class AuthorizePopupStore {
  private shared = createSharedPopupState<AuthorizePopupState>(this.preopenInstanceId, {});

  constructor(public readonly preopenInstanceId: string) {}

  async acceptResult({ result, sessionId }: AuthorizePopupState) {
    this.shared.state.result = result;
    this.shared.state.sessionId = sessionId;
  }
}
