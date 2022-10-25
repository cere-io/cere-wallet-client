import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, when } from 'mobx';
import { createProvider } from '@cere-wallet/wallet-engine';

import { Provider, Wallet } from '../types';
import { AccountStore } from '../AccountStore';
import { NetworkStore } from '../NetworkStore';
import { AssetStore } from '../AssetStore';
import { BalanceStore } from '../BalanceStore';
import { ActivityStore } from '../ActivityStore';
import { AppContextStore } from '../AppContextStore';

export class WalletStore implements Wallet {
  readonly isRoot = false;

  readonly accountStore: AccountStore;
  readonly networkStore: NetworkStore;
  readonly assetStore: AssetStore;
  readonly balanceStore: BalanceStore;
  readonly activityStore: ActivityStore;
  readonly appContextStore: AppContextStore;

  private currentProvider?: Provider;

  constructor(readonly instanceId: string = randomBytes(16).toString('hex')) {
    makeAutoObservable(this);

    this.networkStore = new NetworkStore(this);
    this.accountStore = new AccountStore(this);
    this.assetStore = new AssetStore(this);
    this.balanceStore = new BalanceStore(this.assetStore);
    this.activityStore = new ActivityStore(this);
    this.appContextStore = new AppContextStore(this);
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
    await when(() => !!this.accountStore.account && !!this.networkStore.network);

    const { privateKey } = this.accountStore.account!;
    const chainConfig = this.networkStore.network!;
    const provider = await createProvider({ privateKey, chainConfig });

    this.provider = new providers.Web3Provider(provider);
  }
}
