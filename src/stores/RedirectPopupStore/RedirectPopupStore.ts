import { makeAutoObservable, reaction } from 'mobx';
import { createSharedRedirectState } from '../sharedState';

export class RedirectPopupStore {
  private shared = createSharedRedirectState(this.preopenInstanceId, { local: this.local });

  constructor(public readonly preopenInstanceId: string, private local = false) {
    makeAutoObservable(this);
  }

  waitForRedirectRequest(onRedirectRequest: (url: string) => void) {
    return reaction(
      () => this.shared.state.url,
      (url) => url && onRedirectRequest(url),
      {
        fireImmediately: true,
      },
    );
  }
}
