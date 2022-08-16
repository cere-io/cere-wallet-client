import { action, makeAutoObservable } from 'mobx';
import { ChainConfig, getIFrameOrigin } from '@cere-wallet/communication';
import { createSharedPopupState } from '../sharedState';

export type ConfirmPopupState = {
  network?: ChainConfig;
  content: string;
  status: 'pending' | 'approved' | 'declined';
};

export class ConfirmPopupStore {
  private shared = createSharedPopupState<ConfirmPopupState>(this.instanceId, {
    content: '',
    status: 'pending',
  });

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
    return this.shared.isConnected;
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
