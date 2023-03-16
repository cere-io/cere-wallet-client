import { makeAutoObservable, when } from 'mobx';
import axios from 'axios';

import { Wallet } from '../types';
import { AppContextStore } from '../AppContextStore';
import { DEFAULT_APP_ID, WALLET_API } from '~/constants';

const api = axios.create({
  baseURL: WALLET_API,
});

export class ApplicationsStore {
  constructor(private wallet: Wallet, private contextStore: AppContextStore) {
    makeAutoObservable(this);

    when(
      () => wallet.isReady(),
      () => this.trackActivity(),
    );
  }

  get appId() {
    return this.contextStore.app?.appId || DEFAULT_APP_ID;
  }

  async trackActivity() {
    const [, account] = this.wallet.accounts;

    await api.post('/applications', {
      appId: this.appId,
      address: account.address,
    });
  }
}
