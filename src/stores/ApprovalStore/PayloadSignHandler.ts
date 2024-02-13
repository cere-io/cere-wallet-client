import { when } from 'mobx';
import { PayloadSignRequest } from '@cere-wallet/wallet-engine';

import { PopupManagerStore } from '../PopupManagerStore';
import { NetworkStore } from '../NetworkStore';
import { AppContextStore } from '../AppContextStore';
import { ConfirmPopupState } from '../ConfirmPopupStore';

export class PayloadSignHandler {
  constructor(
    private popupManagerStore: PopupManagerStore,
    private networkStore: NetworkStore,
    private contextStore: AppContextStore,
  ) {}

  async handle({ preopenInstanceId, params: [payload, keyType] }: PayloadSignRequest) {
    const instanceId = preopenInstanceId || this.popupManagerStore.createModal();
    const network: ConfirmPopupState['network'] = { displayName: 'Cere Network', icon: 'cere' };

    const popup = await this.popupManagerStore.proceedTo<ConfirmPopupState>(instanceId, '/confirm', {
      network,
      payload,
      app: this.contextStore.app,
      status: 'pending',
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(instanceId);

    if (!popup.isConnected) {
      throw new Error('User has closed the confirmation popup');
    }

    if (popup.state.status === 'declined') {
      throw new Error('User has declined the signing request');
    }
  }
}
