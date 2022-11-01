import { makeAutoObservable, observable, runInAction, when } from 'mobx';
import { createSharedRedirectState, createSharedPopupState, SharedState, RedirectState } from '../sharedState';

type PopupManangerOptions = {
  onClose?: (instanceId: string) => void;
};

type Modal = {
  instanceId: string;
  open: boolean;
};

export class PopupManagerStore {
  private onClose?: PopupManangerOptions['onClose'];
  private registeredModals: Modal[] = [];

  redirects: Record<string, SharedState<RedirectState>> = {};
  popups: Record<string, SharedState> = {};

  constructor(options: PopupManangerOptions = {}) {
    makeAutoObservable(this, {
      redirects: observable.shallow,
      popups: observable.shallow,
    });

    this.onClose = options.onClose;
  }

  get modals() {
    return this.registeredModals;
  }

  get hasOpenedModals() {
    return !!this.modals.length;
  }

  private hideModal(instanceId: string) {
    const modal = this.registeredModals.find((modal) => modal.instanceId === instanceId);

    if (modal) {
      modal.open = false;
    }
  }

  registerRedirect(instanceId: string, popupType: 'modal' | 'popup' = 'popup') {
    this.redirects[instanceId] = createSharedRedirectState(instanceId);

    if (popupType === 'modal') {
      this.registeredModals.push({ instanceId, open: true });
    }

    return this.redirects[instanceId];
  }

  registerPopup<T = unknown>(instanceId: string, initialState: T) {
    const popup = createSharedPopupState<T>(instanceId, initialState);
    this.popups[instanceId] = popup;

    return popup;
  }

  unregisterAll(instanceId: string) {
    this.popups[instanceId]?.disconnect();
    this.redirects[instanceId]?.disconnect();

    delete this.popups[instanceId];
    delete this.redirects[instanceId];

    this.hideModal(instanceId);
  }

  closePopup(instanceId: string) {
    this.onClose?.(instanceId);
    this.hideModal(instanceId);
  }

  async proceedTo<T = unknown>(instanceId: string, toUrl: string, initialState: T) {
    await this.redirect(instanceId, toUrl);
    const popup = this.registerPopup(instanceId, initialState);

    await when(() => popup.isConnected);

    return popup;
  }

  async redirect(instanceId: string, toUrl: string) {
    const url = new URL(toUrl, window.origin);
    url.searchParams.append('preopenInstanceId', instanceId);

    await when(() => this.redirects[instanceId] && this.redirects[instanceId].isConnected);

    runInAction(() => {
      this.redirects[instanceId].state.url = url.toString();
    });

    return this.redirects[instanceId];
  }

  disposeModal(instanceId: string) {
    this.registeredModals = this.registeredModals.filter((modal) => modal.instanceId !== instanceId);
    console.log('disposeModal', instanceId);
  }
}
