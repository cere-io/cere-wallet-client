import { makeAutoObservable, reaction, runInAction } from 'mobx';
import type { PermissionRequest } from '@cere-wallet/wallet-engine';
import type { UserInfo } from '@cere-wallet/communication';

import { reportError } from '~/reporting';
import { FEATURE_FLAGS } from '~/constants';

import { Web3AuthService } from '../Web3AuthService/Web3AuthService';
import { SessionStore } from '../SessionStore';
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

  private web3AuthService = new Web3AuthService(this.sessionStore);

  private redirectUrl: string | null = null;
  private currentEmail?: string;
  private currentLoginHint?: string;
  private mfaCheckPromise?: Promise<boolean>;
  private selectedPermissions: PermissionRequest = {};
  private appPermissions: PermissionRequest = {};
  private authLinkResource?: AuthLinkResource;
  private _isCheckingConnection = false;
  private _connectionCheckComplete = false;

  constructor(private wallet: Wallet, private options: AuthorizePopupStoreOptions) {
    makeAutoObservable(this);

    const callbackUrl = new URL(this.options.callbackUrl, window.origin);
    this.redirectUrl = options.redirectUrl || callbackUrl.searchParams.get('redirectUrl');

    console.log('AuthorizePopupStore constructor:');
    console.log('  options.redirectUrl:', options.redirectUrl);
    console.log('  callbackUrl:', callbackUrl.toString());
    console.log('  callbackUrl.searchParams.get("redirectUrl"):', callbackUrl.searchParams.get('redirectUrl'));
    console.log('  final this.redirectUrl:', this.redirectUrl);

    this.email = options.email;
    this.currentLoginHint = options.loginHint;

    reaction(
      () => this.email,
      (email) => {
        this.mfaCheckPromise = email && !this.options.forceMfa ? this.checkMfaStatus(email) : undefined;
      },
      {
        /**
         * React immediately to check MFA status for email provided in options
         */
        fireImmediately: true,
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

    // Initialize Web3Auth
    this.web3AuthService.init().catch(reportError);

    // Check for Web3Auth redirect immediately
    this.handleWeb3AuthRedirect();
  }

  get isCheckingConnection(): boolean {
    return this._isCheckingConnection;
  }

  get connectionCheckComplete(): boolean {
    return this._connectionCheckComplete;
  }

  get hasActiveSession(): boolean {
    return !!this.sessionStore.sessionId;
  }

  private handleWeb3AuthRedirect() {
    try {
      // Check if this is a Web3Auth redirect by looking at URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      // Web3Auth v9+ uses these parameters in the redirect
      const hasWeb3AuthParams = hashParams.has('b64Params') || hashParams.has('sessionNamespace');
      if (hasWeb3AuthParams) {
        console.log('Detected Web3Auth redirect, processing...');

        // Try to restore redirectUrl from sessionStorage if it's not available
        if (!this.redirectUrl) {
          const storedRedirectUrl = sessionStorage.getItem('web3auth_redirect_url');
          if (storedRedirectUrl) {
            console.log('Restored redirectUrl from sessionStorage:', storedRedirectUrl);
            this.redirectUrl = storedRedirectUrl;
            // Clean up the stored URL
            sessionStorage.removeItem('web3auth_redirect_url');
          }
        }

        runInAction(() => {
          this._isCheckingConnection = true;
        });

        // Process the redirect after a short delay to ensure Web3Auth is initialized
        setTimeout(async () => {
          try {
            // Initialize Web3Auth - it will handle connected state automatically
            await this.web3AuthService.init();

            // If Web3Auth is connected, process the session
            if (this.web3AuthService.connected) {
              console.log('Web3Auth connected after redirect, processing session...');

              const result = await this.web3AuthService.processExistingSession();

              if (result) {
                runInAction(() => {
                  this.appPermissions = result.permissions || {};
                });

                console.log('Session processed successfully, sessionId:', result.sessionId);

                // Automatically accept the session if no permissions are required
                if (!this.permissions) {
                  console.log('No additional permissions required, auto-accepting session...');
                  await this.acceptSession();
                  return;
                }
              }
            }
            console.log(
              'Web3Auth redirect processing complete. Connected:',
              this.web3AuthService.connected,
              'HasActiveSession:',
              this.hasActiveSession,
            );
          } catch (error) {
            reportError(error);
            console.error('Failed to process Web3Auth redirect:', error);
          } finally {
            runInAction(() => {
              this._isCheckingConnection = false;
              this._connectionCheckComplete = true;
            });
          }
        }, 100);
      } else {
        // Not a Web3Auth redirect, mark check as complete immediately
        runInAction(() => {
          this._connectionCheckComplete = true;
        });

        // Store redirectUrl in sessionStorage before potential Web3Auth redirect
        if (this.redirectUrl) {
          sessionStorage.setItem('web3auth_redirect_url', this.redirectUrl);
        }

        // Also check if we have an existing session in storage
        this.checkExistingSession();
      }
    } catch (error) {
      reportError(error);
      console.error('Failed to handle Web3Auth redirect:', error);
      runInAction(() => {
        this._isCheckingConnection = false;
        this._connectionCheckComplete = true;
      });
    }
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

  private async checkMfaStatus(email: string): Promise<boolean> {
    try {
      // For new Web3Auth SDK, we check MFA status differently
      // This is a simplified implementation - you may need to adjust based on your needs
      return false; // Default to no MFA for now
    } catch (error) {
      reportError(error);
      return false;
    }
  }

  async login(idToken: string): Promise<UserInfo & { sessionId: string }> {
    this.authLinkResource?.dispose();

    try {
      const isMfa = await this.mfaCheckPromise?.catch((error) => {
        reportError(error);
        return undefined;
      });

      if (isMfa || this.options.forceMfa) {
        // For users with MFA enabled, we still use the Web3Auth service
        // but might need to handle the MFA flow differently
        const result = await this.web3AuthService.login({
          idToken,
        });

        runInAction(() => {
          this.appPermissions = result.permissions || {};
        });

        return {
          sessionId: result.sessionId,
          email: result.userInfo.email || '',
          name: result.userInfo.name || '',
          profileImage: result.userInfo.profileImage || '',
          typeOfLogin: result.userInfo.typeOfLogin || 'jwt',
          verifier: result.userInfo.verifier || '',
          verifierId: result.userInfo.verifierId || result.userInfo.email || '',
        };
      }

      // Regular login flow
      const result = await this.web3AuthService.login({
        idToken,
      });

      runInAction(() => {
        this.appPermissions = result.permissions || {};
      });

      return {
        sessionId: result.sessionId,
        email: result.userInfo.email || '',
        name: result.userInfo.name || '',
        profileImage: result.userInfo.profileImage || '',
        typeOfLogin: result.userInfo.typeOfLogin || 'jwt',
        verifier: result.userInfo.verifier || '',
        verifierId: result.userInfo.verifierId || result.userInfo.email || '',
      };
    } catch (error) {
      reportError(error);
      throw error;
    }
  }

  private async validateRedirectUrl(url: string) {
    // With the new Web3Auth SDK, URL validation might be handled differently
    // You may need to implement custom validation logic here
    try {
      new URL(url); // Basic URL validation
      return true;
    } catch {
      throw new Error('The redirect url is not valid');
    }
  }

  async acceptEncodedState(encodedState: string, permissions?: PermissionRequest) {
    // This method might need to be adapted for the new SDK
    // The encoded state handling might be different
    try {
      const jsonResult = Buffer.from(encodedState, 'base64').toString();
      const { coreKitKey, store } = jsonResult && JSON.parse(jsonResult);
      console.log('jsonResult');
      console.log(jsonResult);
      // Create session using the new service
      await this.sessionStore.createSession({
        privateKey: coreKitKey, // You might need to process this differently
        userInfo: {
          email: store.email || '',
          name: store.name || '',
          profileImage: store.profileImage || '',
          typeOfLogin: store.typeOfLogin || '',
          verifier: store.verifier || '',
          verifierId: store.verifierId || '',
        },
      });

      await this.acceptSession(permissions);
    } catch (error) {
      reportError(error);
      throw error;
    }
  }

  async acceptSession(permissions: PermissionRequest = this.acceptedPermissions) {
    this.shared.state.result = {
      permissions: { ...permissions, ...this.appPermissions },
      sessionId: this.sessionStore.sessionId || '',
    };

    console.log('acceptSession called with redirectUrl:', this.redirectUrl);
    console.log('sessionId:', this.sessionStore.sessionId);

    if (!this.redirectUrl) {
      console.log('No redirectUrl found, checking if this is a Web3Auth popup flow...');

      // For Web3Auth popup flows, we might need to close the popup or redirect to a default location
      // Check if we're in a popup context by looking at the URL or window properties
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const hasWeb3AuthParams = hashParams.has('b64Params') || hashParams.has('sessionNamespace');

      if (hasWeb3AuthParams || window.opener) {
        console.log('Detected Web3Auth popup context, closing popup...');
        // This is likely a popup, close it
        if (window.opener) {
          window.close();
        } else {
          // If not a popup, redirect to a default success page or close
          window.location.replace('/');
        }
        return;
      }

      console.log('No redirect URL and not a popup context, staying on current page');
      return;
    }

    await this.validateRedirectUrl(this.redirectUrl);
    await this.sessionStore.storeSession();

    console.log('Redirecting to:', createRedirectUrl(this.redirectUrl, this.sessionStore.sessionId || ''));
    window.location.replace(createRedirectUrl(this.redirectUrl, this.sessionStore.sessionId || ''));

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
      supportEmail: this.options.app?.email,
      authLink: FEATURE_FLAGS.otpLink,
    });

    if (authLinkCode) {
      runInAction(() => {
        this.email = toEmail;

        if (FEATURE_FLAGS.otpLink) {
          this.authLinkResource?.dispose();
          this.authLinkResource = createAuthLinkResource(toEmail, authLinkCode);
        }
      });
    }

    return !!authLinkCode;
  }

  // New methods for MFA management using the modern SDK
  async enableMFA() {
    return this.web3AuthService.enableMFA();
  }

  async showWalletUI() {
    return this.web3AuthService.showWalletUI();
  }

  get walletServicesUrl() {
    return this.web3AuthService.walletServicesUrl;
  }

  private async checkExistingSession() {
    try {
      // Check if we have an existing session in the session store
      const existingSession = await this.sessionStore.rehydrate();
      if (existingSession) {
        console.log('Found existing session, auto-accepting...');
        runInAction(() => {
          this.appPermissions = {}; // No additional permissions from existing session
        });

        // Automatically accept the session if no permissions are required
        if (!this.permissions) {
          await this.acceptSession();
        }
      }
    } catch (error) {
      console.log('No existing session found or session invalid');
      // This is expected if no session exists, so we don't report it as an error
    }
  }
}
