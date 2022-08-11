import { makeAutoObservable, when } from 'mobx';
import { PersonalSignRequest } from '@cere-wallet/wallet-engine';

import { PopupManagerStore } from '../PopupManagerStore';
import { SignPopupStore } from '../SignPopupStore';
import { NetworkStore } from '../NetworkStore';

export class SignerStore {
  constructor(private popupManagerStore: PopupManagerStore, private networkStore: NetworkStore) {
    makeAutoObservable(this);
  }

  async sign({ preopenInstanceId, params }: PersonalSignRequest) {
    await this.popupManagerStore.proceed(preopenInstanceId, '/sign');

    const signStore = new SignPopupStore(preopenInstanceId);
    await when(() => signStore.isConnected);

    signStore.network = this.networkStore.network!;
    signStore.content = params.payload;

    await when(() => signStore.status !== 'pending');
    this.popupManagerStore.closePopup(preopenInstanceId);

    return signStore.status === 'approved';
  }
}
