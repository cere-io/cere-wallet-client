import { randomBytes } from 'crypto';
import { providers } from 'ethers';
import { makeAutoObservable, runInAction, when } from 'mobx';
import { createProvider } from '@cere-wallet/wallet-engine';

import { Provider, Wallet } from '../types';
import { AccountStore } from '../AccountStore';
import { NetworkStore } from '../NetworkStore';

export class WalletStore implements Wallet {
  readonly accountStore: AccountStore;
  readonly networkStore: NetworkStore;
  private currentProvider: Provider | null = null;

  constructor(readonly instanceId: string = randomBytes(16).toString('hex')) {
    makeAutoObservable(this);

    this.networkStore = new NetworkStore(this);
    this.accountStore = new AccountStore(this);
  }

  get provider() {
    return this.currentProvider;
  }

  async init() {
    await when(() => !!this.accountStore.account && !!this.networkStore.network);

    const { privateKey } = this.accountStore.account!;
    const chainConfig = this.networkStore.network!;
    const provider = await createProvider({ privateKey, chainConfig });

    runInAction(() => {
      this.currentProvider = new providers.Web3Provider(provider);
    });
  }
}
