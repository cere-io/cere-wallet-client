import { makeAutoObservable, when } from 'mobx';
import { createSharedRedirectState, createSharedPopupState, SharedState, RedirectState } from '../sharedState';

type PopupManangerOptions = {
  onClose?: (instanceId: string) => void;
};

export class PopupManagerStore {
  private onClose?: PopupManangerOptions['onClose'];
  redirects: Record<string, SharedState<RedirectState>> = {};
  popups: Record<string, SharedState> = {};

  constructor(options: PopupManangerOptions = {}) {
    makeAutoObservable(this);

    this.onClose = options.onClose;
  }

  registerRedirect(instanceId: string) {
    this.redirects[instanceId] = createSharedRedirectState(instanceId);
  }

  unregisterAll(instanceId: string) {
    console.log('unregisterAll', instanceId, {
      popup: this.popups[instanceId],
      redirect: this.redirects[instanceId],
    });

    this.popups[instanceId]?.disconnect();
    this.redirects[instanceId]?.disconnect();

    delete this.popups[instanceId];
    delete this.redirects[instanceId];
  }

  closePopup(instanceId: string) {
    this.onClose?.(instanceId);
  }

  async proceedTo<T = unknown>(instanceId: string, toUrl: string, initialState: T) {
    const redirect: SharedState<RedirectState> = this.redirects[instanceId];
    const [path, search] = toUrl.split('&');
    const searchParams = new URLSearchParams(search);

    searchParams.append('instanceId', instanceId);
    redirect.state.url = `${path}?${searchParams}`;

    const popup = createSharedPopupState<T>(instanceId, initialState);
    this.popups[instanceId] = popup;

    await when(() => popup.isConnected);

    return popup;
  }

  private async connectPopup(instanceId: string) {
    return this.redirects[instanceId];
  }
}
