import { randomBytes } from 'crypto';
import { makeAutoObservable } from 'mobx';
import { AccountStore } from '../AccountStore';
import { NetworkStore } from '../NetworkStore';

export class WalletStore {
  readonly accountStore: AccountStore;
  readonly networkStore: NetworkStore;

  constructor(readonly instanceId: string = randomBytes(16).toString('hex')) {
    makeAutoObservable(this);

    this.accountStore = new AccountStore(this.instanceId);
    this.networkStore = new NetworkStore(this.instanceId);
  }

  async init() {
    console.log('Wallet instance ID', this.instanceId);
  }
}
