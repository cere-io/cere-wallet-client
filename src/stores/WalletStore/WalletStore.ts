import { makeAutoObservable, when } from 'mobx';
import { createWalletEngine } from '@cere-wallet/wallet-engine';
import {
  createWalletConnection,
  createRpcConnection,
  WalletConnection,
  RpcConnection,
} from '@cere-wallet/communication';

import { AccountStore } from '../AccountStore';
import { SignerStore } from '../SignerStore';
import { NetworkStore } from '../NetworkStore';
import { PopupManagerStore } from '../PopupManagerStore';

export class WalletStore {
  readonly accountStore: AccountStore;
  readonly signerStore: SignerStore;
  readonly networkStore: NetworkStore;
  readonly popupManagerStore: PopupManagerStore;

  private walletConnection?: WalletConnection;
  private rpcConnection?: RpcConnection;

  constructor() {
    makeAutoObservable(this);

    this.popupManagerStore = new PopupManagerStore({
      onClose: (instanceId) => this.walletConnection?.closeWindow(instanceId),
    });

    this.accountStore = new AccountStore();
    this.networkStore = new NetworkStore();
    this.signerStore = new SignerStore(this.popupManagerStore, this.networkStore);
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
        this.popupManagerStore.unregister(instanceId);
      },

      onWindowOpen: async ({ instanceId }) => {
        this.popupManagerStore.register(instanceId);
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

      onSign: (request) => this.signerStore.sign(request),
    });

    this.rpcConnection = createRpcConnection({ engine, logger: console });
  }
}
