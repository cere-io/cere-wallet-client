import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, reaction, toJS, when } from 'mobx';
import { createWalletEngine } from '@cere-wallet/wallet-engine';
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

export class EmbeddedWalletStore implements Wallet {
  readonly instanceId = randomBytes(16).toString('hex');
  readonly accountStore: AccountStore;
  readonly approvalStore: ApprovalStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly appContextStore: AppContextStore;
  readonly authenticationStore: AuthenticationStore;
  readonly popupManagerStore: PopupManagerStore;

  private currentProvider?: Provider;
  private walletConnection?: WalletConnection;
  private _isFullscreen = false;

  constructor() {
    makeAutoObservable(this);

    this.popupManagerStore = new PopupManagerStore({
      onClose: (instanceId) => this.walletConnection?.closeWindow(instanceId),
    });

    this.networkStore = new NetworkStore(this);
    this.accountStore = new AccountStore(this);
    this.assetStore = new AssetStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this);
    this.appContextStore = new AppContextStore(this);
    this.authenticationStore = new AuthenticationStore(this.accountStore, this.appContextStore, this.popupManagerStore);
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore);
  }

  isRoot() {
    return true;
  }

  isReady() {
    return !!(this.provider && this.network && this.account);
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
    const walletConnection = createWalletConnection({
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
        return toJS(this.accountStore.userInfo);
      },

      onWindowClose: async ({ instanceId }) => {
        this.popupManagerStore.unregisterAll(instanceId);
      },

      onWindowOpen: async ({ instanceId }) => {
        this.popupManagerStore.registerRedirect(instanceId);
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
      () => !!this.account,
      (loggedIn) => {
        walletConnection.setLoggedInStatus({
          loggedIn,
          verifier: this.account?.verifier,
        });
      },
    );

    this.walletConnection = walletConnection;
  }

  private async setupRpcConnection() {
    await when(() => !!this.networkStore.network);

    const privateKey = this.account?.privateKey;
    const chainConfig = this.networkStore.network!;

    const engine = await createWalletEngine({
      privateKey,
      chainConfig,

      getAccounts: () => (this.account ? [this.account.address] : []),
      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request),
    });

    createRpcConnection({ engine, logger: console });

    if (this.account && this.account?.privateKey !== privateKey) {
      await engine.setupProvider(this.account.privateKey);
    }

    this.provider = new providers.Web3Provider(engine.provider);

    /**
     * Setup provider when account privateKey is changed
     */
    reaction(
      () => this.account?.privateKey,
      (privateKey) => engine.setupProvider(privateKey),
    );
  }
}
