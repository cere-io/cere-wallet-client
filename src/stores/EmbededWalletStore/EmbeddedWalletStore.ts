import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, reaction, runInAction, toJS, when } from 'mobx';
import { createWalletEngine, WalletEngine } from '@cere-wallet/wallet-engine';
import { createWalletConnection, createRpcConnection, WalletConnection } from '@cere-wallet/communication';

import { Provider, Wallet } from '../types';
import { AccountStore } from '../AccountStore';
import { ApprovalStore } from '../ApprovalStore';
import { NetworkStore } from '../NetworkStore';
import { PopupManagerStore } from '../PopupManagerStore';
import { AssetStore } from '../AssetStore';
import { BalanceStore } from '../BalanceStore';
import { ActivityStore } from '../ActivityStore';
import { AppContextStore } from '../AppContextStore';
import { AuthenticationStore } from '../AuthenticationStore';
import { CollectiblesStore } from '../CollectiblesStore';
import { OpenLoginStore } from '../OpenLoginStore';
import { CERE_NETWORK_RPC } from '~/constants';
import { ApplicationsStore } from '../ApplicationsStore';

export class EmbeddedWalletStore implements Wallet {
  readonly instanceId = randomBytes(16).toString('hex');
  readonly accountStore: AccountStore;
  readonly openLoginStore: OpenLoginStore;
  readonly approvalStore: ApprovalStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly collectiblesStore: CollectiblesStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly appContextStore: AppContextStore;
  readonly authenticationStore: AuthenticationStore;
  readonly popupManagerStore: PopupManagerStore;
  readonly applicationsStore: ApplicationsStore;

  private currentEngine?: WalletEngine;
  private currentProvider?: Provider;
  private walletConnection?: WalletConnection;

  private _isWidgetOpened = false;
  private _isFullScreen = false;

  constructor() {
    makeAutoObservable(this);

    this.popupManagerStore = new PopupManagerStore({
      onClose: (instanceId) => this.walletConnection?.closeWindow(instanceId),
    });

    this.networkStore = new NetworkStore(this);
    this.openLoginStore = new OpenLoginStore();
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this, this.assetStore);
    this.appContextStore = new AppContextStore(this);
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore, this.appContextStore);

    this.accountStore = new AccountStore(this);
    this.applicationsStore = new ApplicationsStore(this.accountStore, this.appContextStore);
    this.authenticationStore = new AuthenticationStore(this.accountStore, this.appContextStore, this.popupManagerStore);
  }

  isRoot() {
    return true;
  }

  isReady() {
    return !!(this.provider && this.network && this.account);
  }

  get isWidgetOpened() {
    return this._isWidgetOpened;
  }

  set isWidgetOpened(opened) {
    this._isWidgetOpened = opened;
  }

  get isFullscreen() {
    return this.isWidgetOpened || this._isFullScreen;
  }

  set isFullscreen(isFull) {
    this._isFullScreen = isFull;
  }

  get provider() {
    return this.currentProvider;
  }

  get engine() {
    return this.currentEngine;
  }

  get network() {
    return this.networkStore.network;
  }

  get account() {
    return this.accountStore.account;
  }

  get accounts() {
    return this.accountStore.accounts;
  }

  async init() {
    await Promise.all([this.setupWalletConnection(), this.setupRpcConnection()]);
  }

  private async setupWalletConnection() {
    this.walletConnection = createWalletConnection({
      logger: console,

      onInit: async (data) => {
        this.networkStore.network = data.chainConfig;
        this.appContextStore.context = data.context;

        return true;
      },

      onLogin: async (data) => {
        if (data.loginOptions.uxMode === 'redirect' || !data.preopenInstanceId) {
          this.walletConnection?.redirect(await this.authenticationStore.getRedirectUrl(data.loginOptions));

          // Return never resolving promise to keep `connecting` state till redirection
          return new Promise(() => {});
        }

        if (data.loginOptions.uxMode === 'modal') {
          return this.authenticationStore.loginInModal(data.preopenInstanceId, data);
        }

        return this.authenticationStore.loginInPopup(data.preopenInstanceId, data);
      },

      onLoginWithPrivateKey: async (data) => {
        return this.authenticationStore.loginWithPrivateKey(data);
      },

      onLogout: () => {
        return this.authenticationStore.logout();
      },

      onRehydrate: ({ sessionId }) => {
        return this.authenticationStore.rehydrate({ sessionId });
      },

      onUserInfoRequest: async () => {
        return toJS(await this.accountStore.getUserInfo());
      },

      onWindowClose: async ({ preopenInstanceId }) => {
        this.popupManagerStore.unregisterAll(preopenInstanceId);
      },

      onWindowOpen: async ({ preopenInstanceId, popupMode }) => {
        if (popupMode === 'modal') {
          this.popupManagerStore.registerModal(preopenInstanceId);
        } else {
          this.popupManagerStore.registerRedirect(preopenInstanceId);
        }
      },

      onWalletOpen: async () => {
        return {
          instanceId: this.instanceId,
          target: this.instanceId,
        };
      },

      onAppContextUpdate: async ({ context }) => {
        this.appContextStore.context = context;
      },

      onChangeWidgetVisibility: (isVisible) => {
        if (!isVisible) {
          this.isWidgetOpened = false;
          this.isFullscreen = false;
        }
      },
    });

    /**
     * TODO: Refactor to prevent duplicated messages
     */
    reaction(
      () => !!this.accountStore.userInfo,
      (loggedIn) => {
        this.walletConnection?.setLoggedInStatus({
          loggedIn,
          verifier: this.accountStore.userInfo?.verifier,
        });
      },
    );

    /**
     * Send wallet full screen state updates
     */
    reaction(
      () => this.isFullscreen,
      (isFull) => {
        this.walletConnection?.toggleFullscreen(isFull);
      },
      {
        fireImmediately: true,
      },
    );
  }

  private async setupRpcConnection() {
    await when(() => !!this.networkStore.network);

    const engine = createWalletEngine({
      chainConfig: this.networkStore.network!,
      polkadotRpc: CERE_NETWORK_RPC,
      getPrivateKey: () => this.accountStore.privateKey,
      getAccounts: () => this.accountStore.accounts,
      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request),
      onTransfer: (request) => this.approvalStore.approveTransfer(request),
    });

    createRpcConnection({
      engine,
      logger: console,
    });

    runInAction(() => {
      this.currentEngine = engine;
      this.currentProvider = new providers.Web3Provider(engine.provider);
    });

    reaction(
      () => this.accountStore.accounts,
      (accounts) => engine.updateAccounts(accounts),
      {
        fireImmediately: true,
      },
    );
  }
}
