import { action, makeAutoObservable } from 'mobx';
import { ChainConfig } from '@cere-wallet/communication';
import { createSharedState } from '../createSharedState';

type SignState = {
  content: any;
  network?: ChainConfig;
  status: 'pending' | 'approved' | 'declined';
};

export class SignPopupStore {
  private shared = createSharedState<SignState>(`sign.${this.instanceId}`, {
    content: undefined,
    status: 'pending',
  });

  constructor(public readonly instanceId: string) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
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
