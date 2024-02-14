import { BigNumber } from 'ethers';
import { when } from 'mobx';
import { TransferRequest } from '@cere-wallet/wallet-engine';

import { convertPrice } from './convertPrice';
import { PopupManagerStore } from '../PopupManagerStore';
import { AppContextStore } from '../AppContextStore';
import { TransactionPopupState } from '../TransactionPopupStore';

export class TransferHandler {
  constructor(private popupManagerStore: PopupManagerStore, private contextStore: AppContextStore) {}

  async handle({ preopenInstanceId, proceed, params: [transaction] }: TransferRequest) {
    const instanceId = preopenInstanceId || this.popupManagerStore.createModal();
    const popup = await this.popupManagerStore.proceedTo<TransactionPopupState>(instanceId, '/transaction', {
      status: 'pending',
      step: 'confirmation',
      from: transaction.from,
      to: transaction.to,
      app: this.contextStore.app,
      spending: {
        transfer: {
          symbol: transaction.token,
          amount: convertPrice(BigNumber.from(transaction.balance), {
            decimals: 10, // CERE token decimals
            symbol: transaction.token,
          }),
        },
      },
    });

    await Promise.race([when(() => !popup.isConnected), when(() => popup.state.status !== 'pending')]);
    this.popupManagerStore.closePopup(instanceId);

    if (!popup.isConnected) {
      throw new Error('User has closed the confirmation popup');
    }

    if (popup.state.status === 'declined') {
      throw new Error('User has declined the transfer request');
    }
  }
}
