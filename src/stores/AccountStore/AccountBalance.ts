import { makeAutoObservable } from 'mobx';

import { AccountAssets } from './AccountAssets';

export class AccountBalance {
  constructor(private assets: AccountAssets) {
    makeAutoObservable(this);
  }
}
