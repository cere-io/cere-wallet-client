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
    if (this.context?.banner) {
      return this.context.banner;
    }

    /**
     * Return application context banner in case custom banner is not provided.
     * Or undefined in case the wallet is not in any application context
     */
    const appBanner: AppContext['banner'] = this.app && {
      thumbnailUrl: this.app.logoUrl,
      content: [
        { variant: 'primary', text: 'Return to origin app' },
        { variant: 'secondary', text: this.app.name },
      ],
    };

    return appBanner;
  }

  get app() {
    return this.context?.app;
  }
}
