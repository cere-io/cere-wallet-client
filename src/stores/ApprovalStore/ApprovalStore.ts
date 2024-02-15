import { makeAutoObservable } from 'mobx';
import type {
  PayloadSignRequest,
  PersonalSignRequest,
  SendTransactionRequest,
  TransferRequest,
} from '@cere-wallet/wallet-engine';

import { Wallet, ReadyWallet } from '../types';
import { PopupManagerStore } from '../PopupManagerStore';
import { NetworkStore } from '../NetworkStore';
import { AppContextStore } from '../AppContextStore';

import type { ApproveTransactionOptions } from './TransactionHandler';

export class ApprovalStore {
  constructor(
    private wallet: Wallet,
    private popupManagerStore: PopupManagerStore,
    private networkStore: NetworkStore,
    private contextStore: AppContextStore,
  ) {
    makeAutoObservable(this);
  }

  async approvePersonalSign(params: PersonalSignRequest) {
    const { PersonalSignHandler } = await import(/* webpackChunkName: "PersonalSignHandler" */ './PersonalSignHandler');

    const handler = new PersonalSignHandler(this.popupManagerStore, this.networkStore, this.contextStore);

    return handler.handle(params);
  }

  async approvePayloadSign(params: PayloadSignRequest) {
    const { PayloadSignHandler } = await import(/* webpackChunkName: "PersonalSignHandler" */ './PayloadSignHandler');

    const handler = new PayloadSignHandler(this.popupManagerStore, this.networkStore, this.contextStore);

    return handler.handle(params);
  }

  async approveSendTransaction(params: SendTransactionRequest, options: ApproveTransactionOptions = {}) {
    const { TransactionHandler } = await import(/* webpackChunkName: "TransactionHandler" */ './TransactionHandler');

    const handler = new TransactionHandler(
      this.wallet as ReadyWallet,
      this.popupManagerStore,
      this.networkStore,
      this.contextStore,
    );

    return handler.handle(params, options);
  }

  async approveTransfer(params: TransferRequest) {
    const { TransferHandler } = await import(/* webpackChunkName: "TransferHandler" */ './TransferHandler');

    const handler = new TransferHandler(this.popupManagerStore, this.contextStore);

    return handler.handle(params);
  }
}
