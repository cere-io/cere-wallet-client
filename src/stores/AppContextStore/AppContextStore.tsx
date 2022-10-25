import { AppContext } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';

type SharedState = {
  context?: AppContext;
};

export class AppContextStore {
  private shared = createSharedState<SharedState>(
    `context.${this.wallet.instanceId}`,
    {},
    { readOnly: !this.wallet.isRoot },
  );

  constructor(private wallet: Wallet) {
    makeAutoObservable(this);
  }

  get context() {
    return this.shared.state.context;
  }

  set context(context: AppContext | undefined) {
    this.shared.state.context = context;
  }

  get banner() {
    return this.context?.banner;
  }

  get app() {
    return this.context?.app;
  }
}
