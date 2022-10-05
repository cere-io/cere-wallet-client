import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, runInAction, when } from 'mobx';
import { createWalletEngine, createProvider } from '@cere-wallet/wallet-engine';
import {
  createWalletConnection,
  createRpcConnection,
  WalletConnection,
  RpcConnection,
} from '@cere-wallet/communication';

import { Provider, Wallet } from '../types';
import { AccountStore } from '../AccountStore';
import { ApprovalStore } from '../ApprovalStore';
import { NetworkStore } from '../NetworkStore';
import { PopupManagerStore } from '../PopupManagerStore';
import { AssetStore } from '../AssetStore';
import { BalanceStore } from '../BalanceStore';
import { ActivityStore } from '../ActivityStore';

export class EmbeddedWalletStore implements Wallet {
  readonly isRoot = true;

  readonly instanceId = randomBytes(16).toString('hex');
  readonly accountStore: AccountStore;
  readonly approvalStore: ApprovalStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly popupManagerStore: PopupManagerStore;

  private currentProvider?: Provider;
  private walletConnection?: WalletConnection;
  private rpcConnection?: RpcConnection;
  private _isFullscreen = false;

  constructor() {
    makeAutoObservable(this);

    this.popupManagerStore = new PopupManagerStore({
      onClose: (instanceId) => this.walletConnection?.closeWindow(instanceId),
    });

    this.networkStore = new NetworkStore(this);
    this.accountStore = new AccountStore(this);
    this.assetStore = new AssetStore(this);
    this.balanceStore = new BalanceStore(this.assetStore);
    this.activityStore = new ActivityStore(this);

    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore);
  }

  get isFullscreen() {
    return this._isFullscreen;
  }

  set isFullscreen(isFull) {
    this._isFullscreen = isFull;
    this.walletConnection?.toggleFullscreen(isFull);
  }

  get provider() {
    return this.currentProvider;
  }

  get network() {
    return this.networkStore.network;
  }

  get account() {
    return this.accountStore.account;
  }

  async init() {
    await this.setupWalletConnection();
    await this.setupRpcConnection();
  }

  private async setupWalletConnection() {
    this.walletConnection = createWalletConnection({
      logger: console,

      onInit: async (data) => {
        this.networkStore.network = data.chainConfig;

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
        return this.accountStore.userInfo;
      },

      onWindowClose: async ({ instanceId }) => {
        this.popupManagerStore.unregisterAll(instanceId);
      },

      onWindowOpen: async ({ instanceId }) => {
        this.popupManagerStore.registerRedirect(instanceId);
      },

      onWalletOpen: async () => {
        return this.instanceId;
      },
    });
  }

  private async setupRpcConnection() {
    await when(() => !!this.accountStore.account && !!this.networkStore.network);

    const { privateKey, address } = this.accountStore.account!;
    const chainConfig = this.networkStore.network!;
    const provider = await createProvider({ privateKey, chainConfig });

    const engine = createWalletEngine({
      provider,
      chainConfig,
      accounts: [address],

      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request),
    });

    runInAction(() => {
      this.rpcConnection = createRpcConnection({ engine, logger: console });
      this.currentProvider = new providers.Web3Provider(provider);
    });
  }
}
