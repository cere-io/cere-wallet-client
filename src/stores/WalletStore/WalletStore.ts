import { makeAutoObservable, when } from 'mobx';
import { createWalletEngine, createProvider } from '@cere-wallet/wallet-engine';
import {
  createWalletConnection,
  createRpcConnection,
  WalletConnection,
  RpcConnection,
} from '@cere-wallet/communication';

import { AccountStore } from '../AccountStore';
import { ApprovalStore } from '../ApprovalStore';
import { NetworkStore } from '../NetworkStore';
import { PopupManagerStore } from '../PopupManagerStore';

export class WalletStore {
  readonly accountStore: AccountStore;
  readonly approvalStore: ApprovalStore;
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
    this.approvalStore = new ApprovalStore(this.popupManagerStore, this.networkStore);
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
        this.popupManagerStore.unregisterAll(instanceId);
      },

      onWindowOpen: async ({ instanceId }) => {
        this.popupManagerStore.registerRedirect(instanceId);
      },
    });
  }

  private async setupRpcConnection() {
    await when(() => !!this.accountStore.account && !!this.networkStore.network);

    const network = this.networkStore.network!;
    const account = this.accountStore.account!;

    const provider = await createProvider({
      privateKey: account.privateKey,
      chainConfig: network,
    });

    const engine = createWalletEngine({
      provider,
      chainConfig: network,
      accounts: [account.address],

      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request),
    });

    this.approvalStore.provider = provider;
    this.rpcConnection = createRpcConnection({ engine, logger: console });
  }
}
