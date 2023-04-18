import { makeAutoObservable, reaction, runInAction } from 'mobx';
import axios from 'axios';

import { AccountStore } from '../AccountStore';
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

  constructor(private accountStore: AccountStore, private contextStore: AppContextStore) {
    makeAutoObservable(this);

    reaction(
      () => accountStore.account,
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

  private get headers() {
    const { idToken } = this.accountStore.userInfo || {};

    return !idToken
      ? {}
      : {
          Authorization: `Bearer ${idToken}`,
        };
  }

  private async loadApps() {
    const [ethAccount] = this.accountStore.accounts;
    const { data } = await api.post<Application[]>(
      '/applications/find',
      {
        appId: this.appId,
        address: ethAccount.address,
      },
      { headers: this.headers },
    );

    runInAction(() => {
      this.existingApps = data;
      this.accountStore.isNewUser = !data.some(({ appId }) => appId === this.appId);
    });
  }

  async trackActivity() {
    const [, cereAccount] = this.accountStore.accounts;
    const application: Application = {
      appId: this.appId,
      address: cereAccount.address,
    };

    await api.post('/applications', application, { headers: this.headers });
  }
}
