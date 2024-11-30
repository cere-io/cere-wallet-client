import { AppContext } from '@cere-wallet/communication';
import { makeAutoObservable } from 'mobx';

import { Wallet } from '../types';
import { createSharedState } from '../sharedState';
import { AuthMethod } from '@cere/torus-embed';

export type App = Omit<NonNullable<AppContext['app']>, 'name'> & {
  name: string;
};

export type ContextBanner = AppContext['banner'] & {
  variant?: 'app' | 'banner';
};

type SharedState = {
  context?: AppContext;
  authMethod?: AuthMethod;
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

  set authMethod(authMethod: AuthMethod | undefined) {
    this.shared.state.authMethod = authMethod;
  }

  get authMethod(): AuthMethod | undefined {
    return this.shared.state.authMethod;
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

  get whiteLabel() {
    return this.context?.whiteLabel;
  }

  get app(): App | undefined {
    if (!this.context?.app) {
      return undefined;
    }

    const name = this.context.app.name || new URL(this.context.app.url).hostname;

    return { ...this.context.app, name };
  }

  get isTelegramMiniApp(): boolean {
    return (this.app?.appId as string) == 'telegram-mini-app';
  }

  async disconnect() {
    this.context = undefined;
  }
}
