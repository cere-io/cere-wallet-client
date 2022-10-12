import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { PopupManagerStore } from '../PopupManagerStore';

type LoginData = {
  preopenInstanceId?: string;
};

export class AuthenticationStore {
  constructor(private wallet: Wallet, private popupManagerStore: PopupManagerStore) {
    makeAutoObservable(this);
  }

  async login({ preopenInstanceId }: LoginData) {
    if (preopenInstanceId) {
      await this.loginInPopup(preopenInstanceId);
    } else {
      await this.loginWithRedirect();
    }

    return '';
  }

  private async loginInPopup(preopenInstanceId: string) {
    const popup = await this.popupManagerStore.proceedTo(preopenInstanceId, '/login', {});

    console.log({ popup });
  }

  private async loginWithRedirect() {}
}
