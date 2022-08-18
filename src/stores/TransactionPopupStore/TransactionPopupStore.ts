import { action, makeAutoObservable } from 'mobx';
import { ChainConfig, getIFrameOrigin } from '@cere-wallet/communication';
import { createSharedPopupState } from '../sharedState';
import { PriceData } from '../types';

export type TransactionPopupState = {
  network?: ChainConfig;
  from: string;
  to: string;
  status: 'pending' | 'approved' | 'declined';
  toConfirm?: PriceData;

  spending?: {
    price: PriceData;
    fee: PriceData;
    total: PriceData;
  };

  rawData?: string;
  parsedData?: object;
};

const getAddressData = (address: string, blockExplorer?: string) => ({
  label: address,
  url: blockExplorer && `${blockExplorer}/address/${address}`,
});

export class TransactionPopupStore {
  private shared = createSharedPopupState<TransactionPopupState>(this.instanceId, {
    from: '',
    to: '',
    status: 'pending',
  });

  constructor(public readonly instanceId: string) {
    makeAutoObservable(this, {
      approve: action.bound,
      decline: action.bound,
    });
  }

  get isReady() {
    return this.shared.isConnected;
  }

  get spending() {
    return this.shared.state.spending;
  }

  get toConfirm() {
    return this.shared.state.toConfirm;
  }

  get app() {
    const originUrl = new URL(getIFrameOrigin());

    return {
      url: originUrl.toString(),
      label: originUrl.hostname,
    };
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

  approve() {
    this.shared.state.status = 'approved';
  }

  decline() {
    this.shared.state.status = 'declined';
  }
}
