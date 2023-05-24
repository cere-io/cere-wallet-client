import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';
import { createWalletEngine, WalletEngine } from '@cere-wallet/wallet-engine';
import { DEFAULT_NETWORK, getChainConfig } from '@cere-wallet/communication';

import { Wallet, WalletStatus } from '../types';
import { AccountStore } from '../AccountStore';
import { NetworkStore } from '../NetworkStore';
import { AssetStore } from '../AssetStore';
import { BalanceStore } from '../BalanceStore';
import { ActivityStore } from '../ActivityStore';
import { AppContextStore } from '../AppContextStore';
import { AuthenticationStore } from '../AuthenticationStore';
import { CollectiblesStore } from '../CollectiblesStore';
import { OpenLoginStore } from '../OpenLoginStore';
import { ApprovalStore } from '../ApprovalStore';
import { PopupManagerStore } from '../PopupManagerStore';
import { CERE_NETWORK_RPC, RPC_POLLING_INTERVAL } from '~/constants';
import { ApplicationsStore } from '../ApplicationsStore';
import { SessionStore } from '../SessionStore';

export class WalletStore implements Wallet {
  readonly instanceId: string;
  readonly sessionStore: SessionStore;
  readonly accountStore: AccountStore;
  readonly openLoginStore: OpenLoginStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly collectiblesStore: CollectiblesStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly authenticationStore: AuthenticationStore;
  readonly appContextStore: AppContextStore;
  readonly popupManagerStore: PopupManagerStore;
  readonly approvalStore: ApprovalStore;
  readonly applicationsStore: ApplicationsStore;

  private currentEngine?: WalletEngine;
  private initialized = false;
  private isRootInstance = false;

  constructor(instanceId?: string, sessionNamespace?: string) {
    makeAutoObservable(this);

    this.instanceId = instanceId || randomBytes(16).toString('hex');

    this.networkStore = new NetworkStore(this);
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this, this.assetStore);
    this.appContextStore = new AppContextStore(this);
    this.popupManagerStore = new PopupManagerStore();
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore, this.appContextStore);

    this.sessionStore = new SessionStore({ sessionNamespace });
    this.openLoginStore = new OpenLoginStore(this.sessionStore);
    this.accountStore = new AccountStore(this);

    this.authenticationStore = new AuthenticationStore(
      this,
      this.sessionStore,
      this.accountStore,
      this.appContextStore,
      this.openLoginStore,
      this.popupManagerStore,
    );

    this.applicationsStore = new ApplicationsStore(this.accountStore, this.authenticationStore, this.appContextStore);

    this.setup(!instanceId);
  }

  isRoot() {
    return this.isRootInstance;
  }

  isReady() {
    return !!(this.provider && this.network && this.account);
  }

  get status(): WalletStatus {
    if (this.isReady()) {
      return 'ready';
    }

    if (this.initialized && !this.account) {
      return 'unauthenticated';
    }

    return 'errored';
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

  private async setup(isRoot: boolean) {
    this.isRootInstance = isRoot;

    if (isRoot) {
      this.networkStore.network = getChainConfig(DEFAULT_NETWORK);
    }
  }

  async init(sessionId?: string) {
    try {
      await when(() => !!this.network, { timeout: 1000 });
    } catch {
      console.warn('Connection to origin application has been lost. Configuring the wallet as root instance.');

      await this.setup(true);
    }

    if (this.isRoot()) {
      await this.authenticationStore.rehydrate({ sessionId });
    } else {
      await when(() => !!this.accountStore.privateKey);
    }

    this.engine = createWalletEngine({
      pollingInterval: RPC_POLLING_INTERVAL,
      chainConfig: this.network!,
      polkadotRpc: CERE_NETWORK_RPC,
      getAccounts: (pairs) => this.accountStore.mapAccounts(pairs),
      onUpdateAccounts: (accounts) => this.accountStore.updateAccounts(accounts),
      getPrivateKey: () => this.accountStore.privateKey,
      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request, { showDetails: true }),
      onTransfer: (request) => this.approvalStore.approveTransfer(request),
    });

    await this.engine.updateAccounts();

    runInAction(() => {
      this.initialized = true;
    });

    reaction(
      () => this.accountStore.privateKey,
      () => this.engine?.updateAccounts(),
    );
  }
}
