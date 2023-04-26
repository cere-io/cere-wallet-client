import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, reaction, runInAction, when } from 'mobx';
import { createWalletEngine, WalletEngine } from '@cere-wallet/wallet-engine';
import { DEFAULT_NETWORK, getChainConfig } from '@cere-wallet/communication';

import { Provider, Wallet, WalletStatus } from '../types';
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

export class WalletStore implements Wallet {
  readonly instanceId: string;
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
  private currentProvider?: Provider;
  private initialized = false;
  private isRootInstance = false;

  constructor(instanceId?: string, sessionNamespace?: string, private sessionId?: string) {
    makeAutoObservable(this);

    this.instanceId = instanceId || randomBytes(16).toString('hex');

    this.networkStore = new NetworkStore(this);
    this.openLoginStore = new OpenLoginStore({ sessionNamespace });
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this, this.assetStore);
    this.appContextStore = new AppContextStore(this);
    this.popupManagerStore = new PopupManagerStore();
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore, this.appContextStore);

    this.accountStore = new AccountStore(this);
    this.applicationsStore = new ApplicationsStore(this.accountStore, this.appContextStore);
    this.authenticationStore = new AuthenticationStore(
      this.accountStore,
      this.appContextStore,
      this.openLoginStore,
      this.popupManagerStore,
    );

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

  private async setup(isRoot: boolean) {
    this.isRootInstance = isRoot;

    if (isRoot) {
      this.networkStore.network = getChainConfig(DEFAULT_NETWORK);
    }
  }

  async init() {
    try {
      await when(() => !!this.network, { timeout: 1000 });
    } catch {
      console.warn('Connection to origin application has been lost. Configuring the wallet as root instance.');

      await this.setup(true);
    }

    if (this.isRoot()) {
      await this.authenticationStore.rehydrate({ sessionId: this.sessionId });
    } else {
      await when(() => !!this.accountStore.privateKey);
    }

    const engine = createWalletEngine({
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

    await engine.updateAccounts();

    runInAction(() => {
      this.currentEngine = engine;
      this.currentProvider = new providers.Web3Provider(engine.provider);

      this.currentProvider.pollingInterval = RPC_POLLING_INTERVAL;

      this.initialized = true;
    });

    reaction(
      () => this.accountStore.privateKey,
      () => engine.updateAccounts(),
    );
  }
}
