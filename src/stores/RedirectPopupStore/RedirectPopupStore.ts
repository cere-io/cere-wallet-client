import { autorun, makeAutoObservable } from 'mobx';
import { createSharedRedirectState } from '../sharedState';

export class RedirectPopupStore {
  private shared = createSharedRedirectState(this.instanceId);

  constructor(public readonly instanceId: string) {
    makeAutoObservable(this);
  }

  waitForRedirectRequest(onRedirectRequest: (url: string) => void) {
    return autorun(() => {
      if (this.shared.state.url) {
        onRedirectRequest(this.shared.state.url);
      }
    });
  }
}
