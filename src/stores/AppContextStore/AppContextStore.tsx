import { AppContext } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';

export type ContextBanner = AppContext['banner'] & {
  variant?: 'app' | 'banner';
};

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

  get banner(): ContextBanner | undefined {
    if (this.context?.banner) {
      return { variant: 'banner', ...this.context.banner };
    }

    if (!this.app) {
      return undefined;
    }

    /**
     * Return application context banner in case custom banner is not provided.
     */
    return {
      variant: 'app',
      thumbnailUrl: this.app.logoUrl,
      content: [
        { variant: 'primary', text: 'Return to origin app' },
        { variant: 'secondary', text: this.app.name },
      ],
    };
  }

  get app() {
    return this.context?.app;
  }
}
