import { makeAutoObservable, when } from 'mobx';
import {
  createWalletConnection,
  createRpcConnection,
  WalletConnection,
  RpcConnection,
} from '@cere-wallet/communication';

import { AccountStore } from '../AccountStore';
import { SignerStore } from '../SignerStore';
import { NetworkStore } from '../NetworkStore';
import { createWalletEngine } from '@cere-wallet/wallet-engine';

export class WalletStore {
  readonly accountStore: AccountStore;
  readonly signerStore: SignerStore;
  readonly networkStore: NetworkStore;

  private walletConnection?: WalletConnection;
  private rpcConnection?: RpcConnection;

  constructor() {
    makeAutoObservable(this);

    this.accountStore = new AccountStore();
    this.networkStore = new NetworkStore();
    this.signerStore = new SignerStore();
  }

  async init() {
    await this.setupWalletConnection();
    await this.setupRpcConnection();
  }

  private async setupWalletConnection() {
    this.walletConnection = createWalletConnection({
      logger: console,

      onInit: async (data) => {
        this.networkStore.setNetwork(data.chainConfig);

        return true;
      },

      onLogin: async (data) => {
        return this.accountStore.login(data);
      },

      onLogout: () => {
        return this.accountStore.logout();
      },

      onRehydrate: () => {
        return this.accountStore.rehydrate();
      },

      onUserInfoRequest: async () => {
        return this.accountStore.account?.userInfo;
      },

      onWindowClose: async ({ instanceId }) => {
        console.log('onWindowClose', instanceId);
      },

      onWindowOpen: async ({ instanceId }) => {
        console.log('onWindowOpen', instanceId);
      },
    });
  }

  private async setupRpcConnection() {
    await when(() => !!this.accountStore.account && !!this.networkStore.network);

    const network = this.networkStore.network!;
    const account = this.accountStore.account!;
    const engine = await createWalletEngine({
      accounts: [account.address],
      privateKey: account.privateKey,
      chainConfig: network,
    });

    this.rpcConnection = createRpcConnection({ engine, logger: console });
  }
}
