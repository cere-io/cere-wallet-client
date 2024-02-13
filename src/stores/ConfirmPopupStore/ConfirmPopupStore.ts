import { action, makeAutoObservable } from 'mobx';
import type { PayloadSignData } from '@cere-wallet/wallet-engine';

import { createSharedPopupState } from '../sharedState';
import { PriceData } from '../types';

type Network = {
  displayName: string;
  icon?: string;
};

export type ConfirmPopupState = {
  app?: {
    url: string;
    name: string;
  };

  network?: Network;
  content?: string;
  payload?: PayloadSignData;
  status?: 'pending' | 'approved' | 'declined';
  fee?: PriceData;
};

export class ConfirmPopupStore {
  private shared = createSharedPopupState<ConfirmPopupState>(this.preopenInstanceId, {}, { local: this.isLocal });

  constructor(public readonly preopenInstanceId: string, private isLocal = false) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
  }

  get app() {
    return this.shared.state.app;
  }

  get isReady() {
    return !!this.shared.state.status;
  }

  get fee() {
    return this.shared.state.fee;
  }

  get content() {
    return this.shared.state.content;
  }

  get payload() {
    return this.shared.state.payload;
  }

  get data() {
    if (!this.content && !this.payload) {
      return undefined;
    }

    return { hex: this.content, data: this.payload };
  }

  get network() {
    return this.shared.state.network;
  }

  approve() {
    this.shared.state.status = 'approved';
  }

  decline() {
    this.shared.state.status = 'declined';
  }
}
