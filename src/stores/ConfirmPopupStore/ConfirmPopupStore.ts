import { action, makeAutoObservable } from 'mobx';
import { ChainConfig, getIFrameOrigin } from '@cere-wallet/communication';
import { createSharedState } from '../createSharedState';

type ConfirmPopupState = {
  network?: ChainConfig;
  content: string;
  status: 'pending' | 'approved' | 'declined';
};

export class ConfirmPopupStore {
  private shared = createSharedState<ConfirmPopupState>(`sign.${this.instanceId}`, {
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

  get isConnected() {
    return this.shared.isConnected;
  }

  get content() {
    return this.shared.state.content;
  }

  set content(content) {
    this.shared.state.content = content;
  }

  get network() {
    return this.shared.state.network;
  }

  set network(network) {
    this.shared.state.network = network;
  }

  get status() {
    return this.shared.state.status;
  }

  approve() {
    this.shared.state.status = 'approved';
  }

  decline() {
    this.shared.state.status = 'declined';
  }
}
