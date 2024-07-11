import axios from 'axios';
import { makeAutoObservable, reaction, runInAction, toJS, when } from 'mobx';
import { PermissionRequest } from '@cere-wallet/wallet-engine';

import { ReadyWallet, Wallet } from '../types';
import { DEFAULT_APP_ID, WALLET_API } from '~/constants';
import { AccountStore } from '../AccountStore';
import { AppContextStore } from '../AppContextStore';
import { createAuthToken } from '../AuthenticationStore';

const api = axios.create({
  baseURL: WALLET_API,
});

type ApiApplication = {
  appId: string;
  address: string;
  data: string | null;
};

type ApplicationData = Record<string, any> & {
  permissions?: PermissionRequest;
};

export type Application = Omit<ApiApplication, 'data'> & {
  appId: string;
  address: string;
  permissions?: PermissionRequest;
  data?: Omit<ApplicationData, 'permissions'>;
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
  const { data: response } = await api.post<ApiApplication[]>('/applications/find', filter, {
    headers: authToken ? createHeaders(authToken) : undefined,
  });

  return response.map(({ data: rawData, ...app }) => {
    const data: ApplicationData | undefined = rawData ? JSON.parse(rawData) : undefined;

    return { ...app, permissions: data?.permissions, data };
  });
};

export class ApplicationsStore {
  private existingApps?: Application[];
  private authToken: string | null = null;

  constructor(private wallet: Wallet, private accountStore: AccountStore, private contextStore: AppContextStore) {
    makeAutoObservable(this);

    reaction(
      () => wallet.isReady(),
      () => this.onReady(wallet as ReadyWallet),
    );
  }

  get appId() {
    return this.contextStore.app?.appId || DEFAULT_APP_ID;
  }

  get currentApp() {
    return this.existingApps?.find((app) => app.appId === this.appId);
  }

  private async onReady(wallet: ReadyWallet) {
    const [authToken] = await Promise.all([createAuthToken(wallet.unsafeProvider.getSigner()), this.loadApps()]);

    runInAction(() => {
      this.authToken = authToken;
    });
  }

  private get headers() {
    return !this.authToken ? {} : createHeaders(this.authToken);
  }

  private async loadApps() {
    const [evmAccount] = this.accountStore.accounts;
    const apps = await getUserApplications({ address: evmAccount.address, appId: this.appId }, this.authToken);

    runInAction(() => {
      this.existingApps = apps;
    });

    return apps;
  }

  async saveApplication(data?: ApplicationData) {
    await when(() => !!this.authToken);

    const { email } = this.accountStore.user || {};
    const accounts = this.accountStore.accounts;
    const [evmAccount] = accounts;

    await api.post(
      '/applications',
      {
        email,
        accounts: toJS(accounts),
        appId: this.appId,
        address: evmAccount.address,
        data: JSON.stringify(toJS({ ...this.currentApp?.data, ...data })),
      },
      { headers: this.headers },
    );

    await this.loadApps();

    return this.currentApp!;
  }
}
