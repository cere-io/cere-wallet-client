import { action, makeAutoObservable } from 'mobx';
import { ChainConfig } from '@cere-wallet/communication';
import { createSharedPopupState } from '../sharedState';
import { PriceData } from '../types';

export type TransactionPopupState = {
  network?: ChainConfig;
  from: string;
  to: string;
  status?: 'pending' | 'approved' | 'declined';
  toConfirm?: PriceData;

  app?: {
    url: string;
    name: string;
  };

  spending?: {
    price: PriceData;
    fee: PriceData;
    total: PriceData;
  };

  rawData?: string;
  parsedData?: object;
  action?: string;
};

const getAddressData = (address: string, blockExplorer?: string) => ({
  label: address,
  url: blockExplorer && `${blockExplorer}/address/${address}`,
});

export class TransactionPopupStore {
  private shared = createSharedPopupState<TransactionPopupState>(this.preopenInstanceId, {
    from: '',
    to: '',
  });

  constructor(public readonly preopenInstanceId: string) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
  }

  get isReady() {
    return !!this.shared.state.status;
  }

  get spending() {
    return this.shared.state.spending;
  }

  get toConfirm() {
    return this.shared.state.toConfirm;
  }

  get app() {
    return this.shared.state.app;
  }

  get from() {
    return getAddressData(this.shared.state.from, this.network?.blockExplorer);
  }

  get to() {
    return getAddressData(this.shared.state.to, this.network?.blockExplorer);
  }

  get data() {
    const { rawData: hex, parsedData: data } = this.shared.state;

    if (!hex && !data) {
      return undefined;
    }

    return { hex, data };
  }

  get network() {
    return this.shared.state.network;
  }

  get action() {
    return this.shared.state.action;
  }

  approve() {
    this.shared.state.status = 'approved';
  }

  decline() {
    this.shared.state.status = 'declined';
  }
}
