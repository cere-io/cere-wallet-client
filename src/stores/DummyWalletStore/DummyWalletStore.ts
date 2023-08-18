import { randomBytes } from 'crypto';

import type { Wallet } from '../types';
import { AppContextStore } from '../AppContextStore';

export class DummyWalletStore implements Wallet {
  readonly accounts = [];
  readonly appContextStore: AppContextStore;

  constructor(readonly instanceId = randomBytes(16).toString('hex')) {
    this.appContextStore = new AppContextStore(this);
  }

  isReady() {
    return false;
  }

  isRoot() {
    return false;
  }
}
