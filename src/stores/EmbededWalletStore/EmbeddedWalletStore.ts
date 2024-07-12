import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, reaction, toJS, when } from 'mobx';
import { createWalletEngine, WalletEngine, BiconomyOptions } from '@cere-wallet/wallet-engine';
import { createWalletConnection, createRpcConnection, WalletConnection } from '@cere-wallet/communication';

import { Wallet } from '../types';
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
import { BICONOMY_API_KEY, CERE_NETWORK_RPC, RPC_POLLING_INTERVAL } from '~/constants';
import { ApplicationsStore } from '../ApplicationsStore';
import { SessionStore } from '../SessionStore';
import { PermissionsStore } from '../PermissionsStore';

type InitOptions = {
  biconomy?: BiconomyOptions;
};

export class EmbeddedWalletStore implements Wallet {
  readonly instanceId: string;
  readonly sessionStore: SessionStore;
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
  readonly permissionsStore: PermissionsStore;

  private currentEngine?: WalletEngine;
  private walletConnection?: WalletConnection;

  private _isWidgetOpened = false;
  private _isFullScreen = false;

  private options: InitOptions;

  constructor(instanceId?: string, sessionNamespace?: string) {
    makeAutoObservable(this);

    this.instanceId = instanceId || randomBytes(16).toString('hex');

    this.popupManagerStore = new PopupManagerStore(this, {
      onClose: (instanceId) => this.walletConnection?.closeWindow(instanceId),
    });

    this.networkStore = new NetworkStore(this);
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this, this.assetStore);
    this.appContextStore = new AppContextStore(this);
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore, this.appContextStore);

    this.sessionStore = new SessionStore({ sessionNamespace });
    this.openLoginStore = new OpenLoginStore(this.sessionStore);
    this.accountStore = new AccountStore(this);

    this.applicationsStore = new ApplicationsStore(this, this.accountStore, this.appContextStore);
    this.permissionsStore = new PermissionsStore(this.applicationsStore, this.popupManagerStore, this.appContextStore);
    this.authenticationStore = new AuthenticationStore(
      this,
      this.sessionStore,
      this.accountStore,
      this.applicationsStore,
      this.appContextStore,
      this.openLoginStore,
      this.popupManagerStore,
    );

    /**
     * Default configuration
     */
    this.options = {
      biconomy: BICONOMY_API_KEY ? { apiKey: BICONOMY_API_KEY, debug: true } : undefined,
    };
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
    return this.engine && new providers.Web3Provider(this.engine.provider);
  }

  get unsafeProvider() {
    return this.engine && new providers.Web3Provider(this.engine.unsafeProvider);
  }

  get engine() {
    return this.currentEngine;
  }

  private set engine(engine: WalletEngine | undefined) {
    this.currentEngine = engine;

    if (this.provider) {
      this.provider.pollingInterval = RPC_POLLING_INTERVAL;
    }

    if (this.unsafeProvider) {
      this.unsafeProvider!.pollingInterval = RPC_POLLING_INTERVAL;
    }
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
    await this.setupWalletConnection();
    await this.setupRpcConnection();
  }

  private async setupWalletConnection() {
    this.walletConnection = createWalletConnection({
      logger: console,

      onInit: async ({ chainConfig, context, biconomy }) => {
        this.networkStore.network = chainConfig;
        this.appContextStore.context = context;

        /**
         * Configure the wallet with the init optionss
         */
        if (biconomy) {
          this.options.biconomy = biconomy;
        }

        return true;
      },

      onLogin: async ({ preopenInstanceId, loginOptions }) => {
        if (loginOptions.uxMode === 'redirect' || !preopenInstanceId) {
          this.walletConnection?.redirect(await this.authenticationStore.getRedirectUrl(loginOptions));

          // Return never resolving promise to keep `connecting` state till redirection
          return new Promise(() => {});
        }

        if (loginOptions.uxMode === 'modal') {
          return this.authenticationStore.loginInModal(preopenInstanceId, loginOptions);
        }

        return this.authenticationStore.loginInPopup(preopenInstanceId, loginOptions);
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
        const { sessionNamespace, sessionId } = this.sessionStore;

        return {
          sessionId,
          sessionNamespace,
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

    this.engine = createWalletEngine({
      pollingInterval: RPC_POLLING_INTERVAL,
      chainConfig: this.networkStore.network!,
      polkadotRpc: CERE_NETWORK_RPC,
      biconomy: this.options.biconomy,
      getPrivateKey: () => this.accountStore.privateKey,
      getAccounts: () => toJS(this.accountStore.accounts),
      onUpdateAccounts: (keyPairs) => this.accountStore.updateAccounts(keyPairs),
      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onPayloadSign: (request) => this.approvalStore.approvePayloadSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request),
      onTransfer: (request) => this.approvalStore.approveTransfer(request),

      // Permissions
      getPermissions: () => toJS(this.permissionsStore.permissions),
      onRequestPermissions: (request) => this.permissionsStore.requestPermissions(request),
      onRevokePermissions: (request) => this.permissionsStore.revokePermissions(request),
    });

    createRpcConnection({
      engine: this.engine,
      logger: console,
    });

    reaction(
      () => this.accountStore.privateKey,
      () => this.engine?.updateAccounts(),
    );
  }
}
