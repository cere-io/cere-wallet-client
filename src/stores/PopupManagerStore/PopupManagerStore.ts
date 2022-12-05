import { makeAutoObservable, observable, runInAction, when } from 'mobx';
import { createSharedRedirectState, createSharedPopupState, SharedState, RedirectState } from '../sharedState';

export type PopupManangerOptions = {
  onClose?: (instanceId: string) => void;
};

export type PopupManagerModal = {
  readonly instanceId: string;
  open: boolean;
  path?: string;
};

export class PopupManagerStore {
  private onClose?: PopupManangerOptions['onClose'];

  redirects: Record<string, SharedState<RedirectState>> = {};
  popups: Record<string, SharedState> = {};
  modals: Record<string, PopupManagerModal> = {};

  constructor(options: PopupManangerOptions = {}) {
    makeAutoObservable(this, {
      redirects: observable.shallow,
      popups: observable.shallow,
      modals: observable.shallow,
    });

    this.onClose = options.onClose;
  }

  get currentModal() {
    return Object.values(this.modals).find((modal) => modal.path) as Required<PopupManagerModal> | undefined;
  }

  registerRedirect(instanceId: string) {
    this.redirects[instanceId] = createSharedRedirectState(instanceId);

    return this.redirects[instanceId];
  }

  registerModal(instanceId: string) {
    this.modals[instanceId] = observable.object({ instanceId, open: false });

    return this.modals[instanceId];
  }

  registerPopup<T = unknown>(instanceId: string, initialState: T, local = false) {
    const popup = createSharedPopupState<T>(instanceId, initialState, { local });
    this.popups[instanceId] = popup;

    return popup;
  }

  unregisterAll(instanceId: string) {
    this.popups[instanceId]?.disconnect();
    this.redirects[instanceId]?.disconnect();

    /**
     * In case of opened modal just close it - everything will be unregistered on modal exit
     */
    if (this.modals[instanceId]?.open) {
      return this.hideModal(instanceId);
    }

    delete this.popups[instanceId];
    delete this.redirects[instanceId];
    delete this.modals[instanceId];
  }

  async proceedTo<T = unknown>(instanceId: string, toUrl: string, initialState: T) {
    const isInModal = !!this.modals[instanceId];

    if (!isInModal) {
      await this.redirect(instanceId, toUrl);
    } else {
      this.showModal(instanceId, toUrl);
    }

    const popup = this.registerPopup(instanceId, initialState, isInModal);

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

  closePopup(instanceId: string) {
    this.hideModal(instanceId);
    this.onClose?.(instanceId);
  }

  hideModal(instanceId: string) {
    if (this.modals[instanceId]) {
      this.modals[instanceId].open = false;
    }
  }

  showModal(instanceId: string, path: string) {
    this.modals[instanceId].path = path;
    this.modals[instanceId].open = true;
  }
}
