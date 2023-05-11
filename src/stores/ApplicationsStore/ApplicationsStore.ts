import { makeAutoObservable, reaction, runInAction } from 'mobx';
import axios from 'axios';
import { Account } from '@cere-wallet/wallet-engine';

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
      (account) => (account ? this.onReady(account) : this.cleanUp()),
    );
  }

  get isNewUser() {
    return this.existingApps && !this.existingApps.some(({ appId }) => appId === this.appId);
  }

  get appId() {
    return this.contextStore.app?.appId || DEFAULT_APP_ID;
  }

  private async onReady(account: Account) {
    try {
      await this.loadApps(account);
    } catch {}

    runInAction(() => {
      this.accountStore.isNewUser = this.isNewUser ?? false;
    });

    this.trackActivity(account);
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

  private async loadApps({ address }: Account) {
    const { data } = await api.post<Application[]>(
      '/applications/find',
      {
        address,
        appId: this.appId,
      },
      { headers: this.headers },
    );

    runInAction(() => {
      this.existingApps = data;
    });
  }

  async trackActivity({ address }: Account) {
    await api.post(
      '/applications',
      {
        address,
        appId: this.appId,
      },
      { headers: this.headers },
    );
  }
}
