import { createSharedPopupState } from '../sharedState';

export type AuthorizePopupState = {
  result?: string;
};

export class AuthorizePopupStore {
  private shared = createSharedPopupState<AuthorizePopupState>(this.popupId, {});

  constructor(public readonly popupId: string) {}

  acceptAuthorization(result: AuthorizePopupState['result']) {
    this.shared.state.result = result;
  }
}
