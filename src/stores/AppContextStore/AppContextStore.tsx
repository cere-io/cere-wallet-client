import { AppContext } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';

export type App = Omit<NonNullable<AppContext['app']>, 'name'> & {
  name: string;
};

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
    { readOnly: !this.wallet.isRoot() },
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

    if (!this.context?.app) {
      return undefined;
    }

    const name = this.context.app.name || 'Origin App';
    const domain = new URL(this.context.app.url).hostname;

    /**
     * Return application context banner in case custom banner is not provided.
     */
    return {
      variant: 'app',
      thumbnailUrl: this.context.app.logoUrl,
      content: [
        { variant: 'primary', text: `Return to ${name}` },
        { variant: 'secondary', text: domain },
      ],
    };
  }

  get app(): App | undefined {
    if (!this.context?.app) {
      return undefined;
    }

    const name = this.context.app.name || new URL(this.context.app.url).hostname;

    return { ...this.context.app, name };
  }

  async disconnect() {
    this.context = undefined;
  }
}
