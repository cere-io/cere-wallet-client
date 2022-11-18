import { makeAutoObservable, runInAction, when } from 'mobx';
import { DEFAULT_NETWORK, getChainConfig } from '@cere-wallet/communication';
import { createWalletEngine } from '@cere-wallet/wallet-engine';
import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { AccountStore } from '../AccountStore';
import { ActivityStore } from '../ActivityStore';
import { AppContextStore } from '../AppContextStore';
import { AssetStore } from '../AssetStore';
import { AuthenticationStore } from '../AuthenticationStore';
import { BalanceStore } from '../BalanceStore';
import { CollectiblesStore } from '../CollectiblesStore';
import { NetworkStore } from '../NetworkStore';
import { Provider, Wallet, WalletStatus } from '../types';

export class WalletStore implements Wallet {
  readonly instanceId: string;
  readonly accountStore: AccountStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly collectiblesStore: CollectiblesStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly authenticationStore: AuthenticationStore;
  readonly appContextStore: AppContextStore;

  private currentProvider?: Provider;
  private initialized = false;
  private isRootInstance = false;

  constructor(instanceId?: string) {
    makeAutoObservable(this);

    this.isRootInstance = !instanceId;
    this.instanceId = instanceId || randomBytes(16).toString('hex');

    this.networkStore = new NetworkStore(this);
    this.accountStore = new AccountStore(this);
    this.assetStore = new AssetStore(this);
    this.collectiblesStore = new CollectiblesStore(this);
    this.balanceStore = new BalanceStore(this, this.assetStore);
    this.activityStore = new ActivityStore(this);
    this.appContextStore = new AppContextStore(this);
    this.authenticationStore = new AuthenticationStore(this.accountStore, this.appContextStore);

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

  get network() {
    return this.networkStore.network;
  }

  get account() {
    return this.accountStore.account;
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
      getAccounts: () => this.accountStore.accounts,
      getPrivateKey: () => this.accountStore.privateKey,
    });

    runInAction(() => {
      this.currentProvider = new providers.Web3Provider(engine.provider);
      this.initialized = true;
    });
  }
}
