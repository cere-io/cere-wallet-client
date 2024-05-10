import axios from 'axios';
import { makeAutoObservable, reaction, runInAction, toJS } from 'mobx';
import { Account } from '@cere-wallet/wallet-engine';

import { AccountStore } from '../AccountStore';
import { AppContextStore } from '../AppContextStore';
import { DEFAULT_APP_ID, WALLET_API } from '~/constants';
import { AuthenticationStore } from '../AuthenticationStore';

const api = axios.create({
  baseURL: WALLET_API,
});

type ApiApplication = {
  appId: string;
  address: string;
  data: string | null;
};

export type Application = Omit<ApiApplication, 'data'> & {
  appId: string;
  address: string;
  data?: Record<string, any>;
};

export type ApplicationsFilter = {
  address: string;
  appId?: string;
};

const createHeaders = (authToken?: string) => ({
  Authorization: `Bearer ${authToken}`,
});

export const getUserApplications = async (
  filter: ApplicationsFilter,
  authToken?: string | null,
): Promise<Application[]> => {
  const { data } = await api.post<ApiApplication[]>('/applications/find', filter, {
    headers: authToken ? createHeaders(authToken) : undefined,
  });

  return data.map(({ data, ...app }) => ({
    ...app,
    data: data ? JSON.parse(data) : undefined,
  }));
};

export class ApplicationsStore {
  private existingApps?: Application[];
  private authToken: string | null = null;

  constructor(
    private accountStore: AccountStore,
    private authenticationStore: AuthenticationStore,
    private contextStore: AppContextStore,
  ) {
    makeAutoObservable(this);

    reaction(
      () => accountStore.accounts,
      (accounts) => (accounts.length >= 2 ? this.onReady(accounts) : this.cleanUp()),
    );
  }

  get isNewUser() {
    return this.existingApps && !this.existingApps.some(({ appId }) => appId === this.appId);
  }

  get appId() {
    return this.contextStore.app?.appId || DEFAULT_APP_ID;
  }

  private async onReady(accounts: Account[]) {
    const [ethAccount] = accounts;

    this.authToken = await this.authenticationStore.createToken();

    try {
      await this.loadApps(ethAccount);
    } catch {}

    runInAction(() => {
      this.accountStore.isNewUser = this.isNewUser ?? false;
    });

    this.trackActivity(accounts);
  }

  private cleanUp() {
    this.existingApps = undefined;
  }

  private get headers() {
    return !this.authToken ? {} : createHeaders(this.authToken);
  }

  private async loadApps({ address }: Account) {
    const apps = await getUserApplications({ address, appId: this.appId }, this.authToken);

    runInAction(() => {
      this.existingApps = apps;
    });
  }

  private async trackActivity(accounts: Account[]) {
    const { email } = this.accountStore.user || {};
    const [evmAccount] = accounts;

    await api.post(
      '/applications',
      {
        email,
        accounts: toJS(accounts),
        appId: this.appId,
        address: evmAccount.address,
      },
      { headers: this.headers },
    );
  }
}
