import { action, makeAutoObservable } from 'mobx';
import { ChainConfig } from '@cere-wallet/communication';
import { createSharedPopupState } from '../sharedState';
import { PriceData } from '../types';

export type TransactionPopupState = {
  network?: ChainConfig;
  from: string;
  to: string;
  step?: 'confirmation' | 'details';
  status?: 'pending' | 'approved' | 'declined' | 'done';
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
  transaction?: {
    id: string;
    status: 'pending' | 'confirmed' | 'rejected';
  };
};

const getAddressData = (address: string, blockExplorer?: string) => ({
  label: address,
  url: blockExplorer && `${blockExplorer}/address/${address}`,
});

export class TransactionPopupStore {
  private shared = createSharedPopupState<TransactionPopupState>(
    this.preopenInstanceId,
    {
      from: '',
      to: '',
    },
    { local: this.isLocal },
  );

  constructor(public readonly preopenInstanceId: string, private isLocal = false) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
  }

  get status() {
    return this.shared.state.status;
  }

  get step() {
    return this.shared.state.step;
  }

  get transaction() {
    return this.shared.state.transaction;
  }

  get isReady() {
    return !!this.status;
  }

  get spending() {
    return this.shared.state.spending;
  }

  get toConfirm() {
    return this.shared.state.toConfirm;
  }

  get app() {
    return (
      this.shared.state.app || {
        name: 'Cere wallet',
        url: window.origin,
      }
    );
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

  done() {
    this.shared.state.status = 'done';
  }
}
