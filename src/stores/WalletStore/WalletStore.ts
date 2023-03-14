import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, runInAction, when } from 'mobx';
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
import { CERE_NETWORK_RPC } from '~/constants';

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

  private currentEngine?: WalletEngine;
  private currentProvider?: Provider;
  private initialized = false;
  private isRootInstance = false;

  constructor(instanceId?: string) {
    makeAutoObservable(this);

    this.isRootInstance = !instanceId;
    this.instanceId = instanceId || randomBytes(16).toString('hex');

    this.networkStore = new NetworkStore(this);
    this.accountStore = new AccountStore(this);
    this.openLoginStore = new OpenLoginStore();
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this, this.assetStore);
    this.appContextStore = new AppContextStore(this);
    this.authenticationStore = new AuthenticationStore(this.accountStore, this.appContextStore);
    this.popupManagerStore = new PopupManagerStore();
    this.approvalStore = new ApprovalStore(this, this.popupManagerStore, this.networkStore, this.appContextStore);

    if (this.isRoot()) {
      this.networkStore.network = getChainConfig(DEFAULT_NETWORK);
    }
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

  async init() {
    await when(() => !!this.network);

    if (this.isRoot()) {
      await this.authenticationStore.rehydrate();
    } else {
      await when(() => !!this.accountStore.privateKey);
    }

    const engine = createWalletEngine({
      chainConfig: this.network!,
      polkadotRpc: CERE_NETWORK_RPC,
      getAccounts: () => this.accountStore.accounts,
      getPrivateKey: () => this.accountStore.privateKey,
      onPersonalSign: (request) => this.approvalStore.approvePersonalSign(request),
      onSendTransaction: (request) => this.approvalStore.approveSendTransaction(request, { showDetails: true }),
    });

    runInAction(() => {
      this.currentEngine = engine;
      this.currentProvider = new providers.Web3Provider(engine.provider);

      this.initialized = true;
    });
  }
}
