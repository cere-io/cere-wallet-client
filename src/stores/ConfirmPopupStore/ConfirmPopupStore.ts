import { action, makeAutoObservable } from 'mobx';
import { ChainConfig, getIFrameOrigin } from '@cere-wallet/communication';
import { createSharedPopupState } from '../sharedState';
import { PriceData } from '../types';

export type ConfirmPopupState = {
  network?: ChainConfig;
  content?: string;
  status?: 'pending' | 'approved' | 'declined';
  fee?: PriceData;
};

export class ConfirmPopupStore {
  private shared = createSharedPopupState<ConfirmPopupState>(this.instanceId, {});

  constructor(public readonly instanceId: string) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
  }

  get app() {
    const originUrl = new URL(getIFrameOrigin());

    return {
      url: originUrl.toString(),
      label: originUrl.hostname,
    };
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
