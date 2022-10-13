import { makeAutoObservable, observable, runInAction, when } from 'mobx';
import { createSharedRedirectState, createSharedPopupState, SharedState, RedirectState } from '../sharedState';

type PopupManangerOptions = {
  onClose?: (instanceId: string) => void;
};

export class PopupManagerStore {
  private onClose?: PopupManangerOptions['onClose'];
  redirects: Record<string, SharedState<RedirectState>> = {};
  popups: Record<string, SharedState> = {};

  constructor(options: PopupManangerOptions = {}) {
    makeAutoObservable(this, {
      redirects: observable.shallow,
      popups: observable.shallow,
    });

    this.onClose = options.onClose;
  }

  registerRedirect(instanceId: string) {
    this.redirects[instanceId] = createSharedRedirectState(instanceId);
  }

  unregisterAll(instanceId: string) {
    this.popups[instanceId]?.disconnect();
    this.redirects[instanceId]?.disconnect();

    delete this.popups[instanceId];
    delete this.redirects[instanceId];
  }

  closePopup(instanceId: string) {
    this.onClose?.(instanceId);
  }

  async proceedTo<T = unknown>(instanceId: string, toUrl: string, initialState: T) {
    await this.redirect(instanceId, toUrl);

    const popup = createSharedPopupState<T>(instanceId, initialState);
    this.popups[instanceId] = popup;

    await when(() => popup.isConnected);

    return popup;
  }

  private async redirect(instanceId: string, toUrl: string) {
    const url = new URL(toUrl, window.origin);
    url.searchParams.append('instanceId', instanceId);

    await when(() => !!this.redirects[instanceId]);

    runInAction(() => {
      this.redirects[instanceId].state.url = url.toString();
    });
  }
}
