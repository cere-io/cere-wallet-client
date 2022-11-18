import { makeAutoObservable, reaction, toJS, when } from 'mobx';
import { WalletConnection, createRpcConnection, createWalletConnection } from '@cere-wallet/communication';
import { createWalletEngine } from '@cere-wallet/wallet-engine';
import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { AccountStore } from '../AccountStore';
import { ActivityStore } from '../ActivityStore';
import { AppContextStore } from '../AppContextStore';
import { ApprovalStore } from '../ApprovalStore';
import { AssetStore } from '../AssetStore';
import { AuthenticationStore } from '../AuthenticationStore';
import { BalanceStore } from '../BalanceStore';
import { CollectiblesStore } from '../CollectiblesStore';
import { NetworkStore } from '../NetworkStore';
import { PopupManagerStore } from '../PopupManagerStore';
import { Provider, Wallet } from '../types';

export class EmbeddedWalletStore implements Wallet {
  readonly instanceId = randomBytes(16).toString('hex');
  readonly accountStore: AccountStore;
  readonly approvalStore: ApprovalStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly collectiblesStore: CollectiblesStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly appContextStore: AppContextStore;
  readonly authenticationStore: AuthenticationStore;
  readonly popupManagerStore: PopupManagerStore;

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
    this.accountStore = new AccountStore(this);
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this);
    this.appContextStore = new AppContextStore(this);
    this.authenticationStore = new AuthenticationStore(this.accountStore, this.appContextStore, this.popupManagerStore);
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore, this.appContextStore);
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

  private set provider(provider) {
    this.currentProvider = provider;
  }

  get network() {
    return this.networkStore.network;
  }

  get account() {
    return this.accountStore.account;
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
        if (data.loginOptions.mode === 'redirect' || !data.preopenInstanceId) {
          this.walletConnection?.redirect(await this.authenticationStore.getRedirectUrl(data.loginOptions));

          // Return never resolving promise to keep `connecting` state till redirection
          return new Promise(() => {});
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
        return toJS(this.accountStore.loginData?.userInfo);
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
      (isFull) => this.walletConnection?.toggleFullscreen(isFull),
      {
        fireImmediately: true,
      },
    );
  }

  private async setupRpcConnection() {
    await when(() => !!this.networkStore.network);

    const engine = createWalletEngine({
      chainConfig: this.networkStore.network!,
      getPrivateKey: () => this.accountStore.privateKey,
      getAccounts: () => this.accountStore.accounts,
      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request),
    });

    this.provider = new providers.Web3Provider(engine.provider);

    createRpcConnection({
      engine,
      logger: console,
    });

    reaction(
      () => this.accountStore.accounts,
      (accounts) => engine.updateAccounts(accounts),
    );
  }
}
