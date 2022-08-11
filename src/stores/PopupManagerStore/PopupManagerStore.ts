import { makeAutoObservable, when } from 'mobx';
import { createSharedState, SharedState } from '../createSharedState';

type PopupManangerOptions = {
  onClose?: (instanceId: string) => void;
};

type PopupState = {
  url?: string;
};

export class PopupManagerStore {
  private onClose?: PopupManangerOptions['onClose'];
  popups: Record<string, SharedState<PopupState>> = {};

  constructor(options: PopupManangerOptions = {}) {
    makeAutoObservable(this);

    this.onClose = options.onClose;
  }

  waitForRedirectRequest(instanceId: string, onRedirectRequest: (url: string) => void) {
    const redirect = createSharedState<PopupState>(`redirect.${instanceId}`, {});

    when(
      () => redirect.isConnected && !!redirect.state.url,
      () => onRedirectRequest(redirect.state.url!),
    );
  }

  register(instanceId: string) {
    this.popups[instanceId] = createSharedState<PopupState>(`redirect.${instanceId}`, {});
  }

  unregister(instanceId: string) {
    delete this.popups[instanceId];
  }

  closePopup(instanceId: string) {
    this.onClose?.(instanceId);
  }

  async proceed(instanceId: string, toUrl: string) {
    const popup = await this.connectPopup(instanceId);
    const [path, search] = toUrl.split('&');
    const searchParams = new URLSearchParams(search);
    searchParams.append('instanceId', instanceId);

    popup.state.url = `${path}?${searchParams}`;
  }

  private async connectPopup(instanceId: string) {
    await when(() => this.popups[instanceId].isConnected);

    return this.popups[instanceId];
  }
}
