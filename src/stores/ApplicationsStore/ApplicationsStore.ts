import axios from 'axios';
import { Wallet as PrivateKeySigner } from 'ethers';
import { makeAutoObservable, runInAction, toJS } from 'mobx';
import { PermissionRequest } from '@cere-wallet/wallet-engine';

import { Wallet } from '../types';
import { DEFAULT_APP_ID, WALLET_API } from '~/constants';
import { Session } from '../SessionStore';
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

type ApplicationData = {
  permissions?: PermissionRequest;
};

export type Application = {
  appId: string;
  permissions: PermissionRequest;
};

export type ApplicationsFilter = {
  address: string;
  appId?: string;
};

const createHeaders = (authToken?: string) => ({
  Authorization: `Bearer ${authToken}`,
});

const mapApplication = ({ data: rawData, appId }: ApiApplication): Application => {
  const data: ApplicationData | undefined = rawData ? JSON.parse(rawData) : undefined;

  return { appId, permissions: data?.permissions || {} };
};

export const getUserApplications = async (
  filter: ApplicationsFilter,
  authToken?: string | null,
): Promise<Application[]> => {
  const { data: response } = await api.post<ApiApplication[]>('/applications/find', filter, {
    headers: authToken ? createHeaders(authToken) : undefined,
  });

  return response.map(mapApplication);
};

export class ApplicationsStore {
  private currentApp?: Application;

  constructor(private wallet: Wallet, private accountStore: AccountStore, private contextStore: AppContextStore) {
    makeAutoObservable(this);
  }

  private async createAccsess(session?: Session) {
    const privateKey = session?.privateKey || this.accountStore.privateKey;

    if (!privateKey || !this.wallet.network) {
      throw new Error('Wallet is not ready to load applications');
    }

    const signer = new PrivateKeySigner(privateKey);
    const authToken = await createAuthToken(signer, { chainId: this.wallet.network.chainId });

    return {
      authToken,
      address: await signer.getAddress(),
      headers: createHeaders(authToken),
    };
  }

  get appId() {
    return this.contextStore.app?.appId || DEFAULT_APP_ID;
  }

  get connectedApp() {
    return this.currentApp || { appId: this.appId, permissions: {} };
  }

  async loadConnectedApp(session?: Session) {
    const { authToken, address } = await this.createAccsess(session);
    const apps = await getUserApplications({ address, appId: this.appId }, authToken);

    runInAction(() => {
      this.currentApp = apps.find((app) => app.appId === this.appId);
    });

    return this.connectedApp;
  }

  async saveApplication({ permissions = {} }: ApplicationData) {
    this.currentApp = { appId: this.appId, permissions };

    const { headers, address } = await this.createAccsess();
    const { email } = this.accountStore.user || {};

    const { data } = await api.post<ApiApplication>(
      '/applications',
      {
        email,
        address,
        accounts: toJS(this.accountStore.accounts),
        appId: this.appId,
        data: JSON.stringify(toJS({ permissions })),
      },
      { headers },
    );

    runInAction(() => {
      this.currentApp = mapApplication(data);
    });

    return this.currentApp!;
  }
}
