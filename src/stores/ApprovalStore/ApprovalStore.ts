import { makeAutoObservable, runInAction, when } from 'mobx';
import { PersonalSignRequest } from '@cere-wallet/wallet-engine';

import { PopupManagerStore } from '../PopupManagerStore';
import { ConfirmPopupStore } from '../ConfirmPopupStore';
import { NetworkStore } from '../NetworkStore';

export class ApprovalStore {
  constructor(private popupManagerStore: PopupManagerStore, private networkStore: NetworkStore) {
    makeAutoObservable(this);
  }

  async approvePersonalSign({ preopenInstanceId, params }: PersonalSignRequest) {
    await this.popupManagerStore.proceed(preopenInstanceId, '/confirm');

    const confirmPopup = new ConfirmPopupStore(preopenInstanceId);
    await when(() => confirmPopup.isConnected);

    runInAction(() => {
      confirmPopup.network = this.networkStore.network;
      confirmPopup.content = params.payload;
    });

    await when(() => confirmPopup.status !== 'pending');
    this.popupManagerStore.closePopup(preopenInstanceId);

    return confirmPopup.status === 'approved';
  }
}
