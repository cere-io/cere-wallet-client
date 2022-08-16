import { makeAutoObservable, when } from 'mobx';
import { PersonalSignRequest } from '@cere-wallet/wallet-engine';

import { PopupManagerStore } from '../PopupManagerStore';
import { ConfirmPopupState } from '../ConfirmPopupStore';
import { NetworkStore } from '../NetworkStore';

export class ApprovalStore {
  constructor(private popupManagerStore: PopupManagerStore, private networkStore: NetworkStore) {
    makeAutoObservable(this);
  }

  async approvePersonalSign({ preopenInstanceId, params }: PersonalSignRequest) {
    const popup = await this.popupManagerStore.proceedTo<ConfirmPopupState>(preopenInstanceId, '/confirm', {
      network: this.networkStore.network,
      content: params.payload,
      status: 'pending',
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(preopenInstanceId);

    if (!popup.isConnected) {
      throw new Error('User has closed the confirmation popup');
    }

    if (popup.state.status === 'declined') {
      throw new Error('User has declined the signing request');
    }
  }
}
