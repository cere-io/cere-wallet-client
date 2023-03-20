import { makeAutoObservable, reaction, runInAction } from 'mobx';
import axios from 'axios';

import { Wallet } from '../types';
import { AppContextStore } from '../AppContextStore';
import { DEFAULT_APP_ID, WALLET_API } from '~/constants';

const api = axios.create({
  baseURL: WALLET_API,
});

type Application = {
  appId: string;
  address: string;
};

export class ApplicationsStore {
  private existingApps?: Application[];

  constructor(private wallet: Wallet, private contextStore: AppContextStore) {
    makeAutoObservable(this);

    reaction(
      () => wallet.isReady(),
      (isReady) => (isReady ? this.onReady() : this.cleanUp()),
    );
  }

  get isNewUser() {
    return this.existingApps && !this.existingApps.some(({ appId }) => appId === this.appId);
  }

  get appId() {
    return this.contextStore.app?.appId || DEFAULT_APP_ID;
  }

  private async onReady() {
    await this.loadApps();
    await this.trackActivity();
  }

  private cleanUp() {
    this.existingApps = undefined;
  }

  private async loadApps() {
    const [, account] = this.wallet.accounts;

    const { data } = await api.post<Application[]>('/applications/find', {
      appId: this.appId,
      address: account.address,
    });

    runInAction(() => {
      this.existingApps = data;
    });
  }

  async trackActivity() {
    const [, account] = this.wallet.accounts;
    const application: Application = {
      appId: this.appId,
      address: account.address,
    };

    await api.post('/applications', application);
  }
}
