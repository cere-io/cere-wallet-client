import { makeAutoObservable, reaction, runInAction } from 'mobx';
import type { PermissionRequest } from '@cere-wallet/wallet-engine';
import type { UserInfo } from '@cere-wallet/communication';

import { reportError } from '~/reporting';
import { OpenLoginStore } from '../OpenLoginStore';
import { SessionStore } from '../SessionStore';
import { Web3AuthStore } from '../Web3AuthStore';
import { type App } from '../AppContextStore';
import { createSharedPopupState } from '../sharedState';
import { createRedirectUrl } from './createRedirectUrl';
import { Wallet } from '../types';
import { AuthApiService } from '~/api/auth-api.service';
import { createAuthLinkResource, AuthLinkResource, AuthLinkResourcePayload } from './createAuthLinkResource';

type AuthenticationResult = {
  sessionId: string;
  permissions?: PermissionRequest;
};

export type AuthorizePopupStoreOptions = {
  popupId: string;
  callbackUrl: string;
  redirectUrl?: string;
  forceMfa?: boolean;
  sessionNamespace?: string;
  app?: App;
  loginHint?: string;
  email?: string;
};

export type AuthorizePopupState = {
  result?: AuthenticationResult;
  permissions?: PermissionRequest;
};

export class AuthorizePopupStore {
  private shared = createSharedPopupState<AuthorizePopupState>(this.options.popupId, {});
  private sessionStore = new SessionStore({
    sessionNamespace: this.options.sessionNamespace,
  });

  private openLoginStore = new OpenLoginStore(this.sessionStore);
  private web3AuthStore = new Web3AuthStore(this.wallet, this.sessionStore);

  private redirectUrl: string | null = null;
  private currentEmail?: string;
  private currentLoginHint?: string;
  private mfaCheckPromise?: Promise<boolean>;
  private selectedPermissions: PermissionRequest = {};
  private appPermissions: PermissionRequest = {};
  private authLinkResource?: AuthLinkResource;

  constructor(private wallet: Wallet, private options: AuthorizePopupStoreOptions) {
    makeAutoObservable(this);

    const callbackUrl = new URL(this.options.callbackUrl, window.origin);
    this.redirectUrl = options.redirectUrl || callbackUrl.searchParams.get('redirectUrl');
    this.email = options.email;
    this.currentLoginHint = options.loginHint;

    reaction(
      () => this.email,
      (verifierId) => {
        this.mfaCheckPromise =
          verifierId && !this.options.forceMfa ? this.web3AuthStore.isMfaEnabled({ verifierId }) : undefined;
      },
    );

    reaction(
      () => this.permissions,
      (permissions) => {
        /**
         * Select all permissions by default
         */
        this.acceptedPermissions = permissions || {};
      },
    );
  }

  get email() {
    return this.currentEmail;
  }

  set email(email) {
    this.currentEmail = email;
  }

  get loginHint() {
    return this.currentLoginHint;
  }

  get permissions() {
    const { permissions = {} } = this.shared.state;
    const finalPermissions = { ...permissions };

    for (const capability in this.appPermissions) {
      delete finalPermissions[capability];
    }

    return Object.keys(finalPermissions).length ? finalPermissions : undefined;
  }

  get acceptedPermissions() {
    return this.selectedPermissions || {};
  }

  set acceptedPermissions(permissions: PermissionRequest) {
    this.selectedPermissions = permissions;
  }

  async login(idToken: string): Promise<UserInfo & { sessionId: string }> {
    this.authLinkResource?.dispose();

    const isMfa = await this.mfaCheckPromise?.catch((error) => {
      reportError(error);

      return undefined; // Mark `isMfa` as undefined to check again later
    });

    if (isMfa || this.options.forceMfa) {
      /**
       * Fallback to OpenLogin authentication for users with MFA enabled
       */
      return this.openLoginStore.login({
        idToken,
        preopenInstanceId: this.options.popupId,
        redirectUrl: this.options.callbackUrl,
      }) as Promise<any>; // Use any to avoid type mismatch. The return type is not important here due to redirect.
    }

    const { userInfo, permissions } = await this.web3AuthStore.login({
      idToken,
      appId: this.options.app?.appId,
      checkMfa: isMfa === undefined,
    });

    runInAction(() => {
      this.appPermissions = permissions;
    });

    return {
      sessionId: this.sessionStore.sessionId,
      ...userInfo,
    };
  }

  private async validateRedirectUrl(url: string) {
    const isValid = await this.openLoginStore.isAllowedRedirectUrl(url);

    if (!isValid) {
      throw new Error('The redirect url is not allowed');
    }
  }

  async acceptEncodedState(encodedState: string, permissions?: PermissionRequest) {
    await this.openLoginStore.acceptEncodedState(encodedState);

    await this.acceptSession(permissions);
  }

  async acceptSession(permissions: PermissionRequest = this.acceptedPermissions) {
    this.shared.state.result = {
      permissions: { ...permissions, ...this.appPermissions },
      sessionId: this.sessionStore.sessionId,
    };

    if (!this.redirectUrl) {
      return;
    }

    await this.validateRedirectUrl(this.redirectUrl);
    await this.sessionStore.storeSession();

    window.location.replace(createRedirectUrl(this.redirectUrl, this.sessionStore.sessionId));

    return new Promise<void>(() => {});
  }

  waitForAuthLinkToken(callback: (payload: AuthLinkResourcePayload) => Promise<void>) {
    return reaction(
      () => this.authLinkResource?.current(),
      (payload) => payload && callback(payload),
    );
  }

  async sendOtp(email?: string) {
    const toEmail = email || this.email;

    if (!toEmail) {
      throw new Error('Email is required to send OTP');
    }

    const authLinkCode = await AuthApiService.sendOtp(toEmail, {
      appTitle: this.options.app?.name,
      supportEmail: this.options.app?.supportEmail,
    });

    if (authLinkCode) {
      this.authLinkResource?.dispose();

      runInAction(() => {
        this.email = toEmail;
        this.authLinkResource = createAuthLinkResource(toEmail, authLinkCode);
      });
    }

    return !!authLinkCode;
  }
}
