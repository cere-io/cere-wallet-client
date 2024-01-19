import { when } from 'mobx';
import { PersonalSignRequest } from '@cere-wallet/wallet-engine';

import { PopupManagerStore } from '../PopupManagerStore';
import { NetworkStore } from '../NetworkStore';
import { AppContextStore } from '../AppContextStore';
import { ConfirmPopupState } from '../ConfirmPopupStore';

export class PersonalSignHandler {
  constructor(
    private popupManagerStore: PopupManagerStore,
    private networkStore: NetworkStore,
    private contextStore: AppContextStore,
  ) {}

  async handle({ preopenInstanceId, params: [content, address, keyType] }: PersonalSignRequest) {
    const instanceId = preopenInstanceId || this.popupManagerStore.createModal();
    const network: ConfirmPopupState['network'] =
      keyType === 'ed25519' ? { displayName: 'Cere Network', icon: 'cere' } : this.networkStore.network;

    const popup = await this.popupManagerStore.proceedTo<ConfirmPopupState>(instanceId, '/confirm', {
      network,
      content,
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
