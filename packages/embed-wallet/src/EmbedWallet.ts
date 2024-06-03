import EventEmitter from 'events';
import Torus, { TORUS_BUILD_ENV_TYPE, preloadIframe } from '@cere/torus-embed';
import BN from 'bn.js';

import { createContext } from './createContext';
import { getAuthRedirectResult } from './getAuthRedirectResult';
import { ProxyProvider, ProviderInterface, SignerInterface } from './Provider';
import { Signer, SignerOptions } from './Signer';
import { WALLET_CLIENT_VERSION } from './constants';

import {
  WalletStatus,
  WalletEvent,
  WalletScreen,
  WalletEnvironment,
  WalletInitOptions,
  WalletConnectOptions,
  WalletShowOptions,
  WalletSetContextOptions,
  UserInfo,
  Context,
  WalletAccount,
  ProviderEvent,
  WalletTransferOptions,
  WalletBalance,
  PartialContext,
  WalletOptions,
  PermissionRequest,
  PermissionRevokeRequest,
  RequestedPermission,
  Permission,
} from './types';

const buildEnvMap: Record<WalletEnvironment, TORUS_BUILD_ENV_TYPE> = {
  local: 'development',
  dev: 'cere-dev',
  stage: 'cere-stage',
  /**
   * TODO: Change back to 'cere' when the MetaMask block issue is resolved
   *
   * @see https://github.com/MetaMask/eth-phishing-detect/issues/19072
   */
  prod: 'cere-aws',
};

const createBalance = (
  token: WalletBalance['token'],
  type: WalletBalance['type'],
  rawBalance: string,
  rawDecimals: string | number,
): WalletBalance => {
  const decimals = new BN(rawDecimals);
  const balance = new BN(rawBalance);

  return {
    token,
    type,
    balance,
    decimals,
    amount: balance.div(new BN(10).pow(decimals)),
  };
};

export class EmbedWallet {
  private options: WalletOptions = {};

  private torus: Torus;
  private eventEmitter: EventEmitter;
  private currentStatus: WalletStatus = 'not-ready';
  private defaultContext: Context;
  private proxyProvider: ProxyProvider;
  private connectOptions: WalletConnectOptions = {};
  private onAfterInit?: (error?: any) => void;

  /**
   * @description Promise that resolves when the wallet instance is initialized and ready
   */
  readonly isReady: Promise<EmbedWallet>;

  constructor({ env, clientVersion = WALLET_CLIENT_VERSION, ...options }: WalletOptions = {}) {
    if (env) {
      preloadIframe(buildEnvMap[env], clientVersion);
    }

    this.eventEmitter = new EventEmitter();
    this.torus = new Torus();
    this.proxyProvider = new ProxyProvider();
    this.defaultContext = createContext();
    this.options = { ...options, clientVersion, env: env || 'prod' };

    this.isReady = new Promise((resolve, reject) => {
      this.onAfterInit = (error) => (error ? reject(error) : resolve(this));
    });

    this.provider.on('message', this.handleEvenets);
  }

  private handleEvenets = ({ type, data }: ProviderEvent) => {
    if (type === 'wallet_accountsChanged') {
      this.eventEmitter.emit('accounts-update', data);

      if (!this.torus.isLoggedIn) {
        this.setStatus('ready');
      }
    }

    if (type === 'ed25519_balanceChanged') {
      this.eventEmitter.emit('balance-update', createBalance('CERE', 'native', data.balance, 10)); // TODO: Do not hardcode CERE token decimals. Should be returned from the wallet.
    }

    if (type === 'eth_balanceChanged') {
      this.eventEmitter.emit('balance-update', createBalance('CERE', 'erc20', data.balance, 10)); // TODO: Do not hardcode CERE token decimals. Should be returned from the wallet.
    }
  };

  private setStatus(status: WalletStatus) {
    const prevStatus = this.currentStatus;

    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.eventEmitter.emit('status-update', this.currentStatus, prevStatus);
    }

    return () => this.setStatus(prevStatus);
  }

  get provider(): ProviderInterface {
    return this.proxyProvider;
  }

  get status() {
    return this.currentStatus;
  }

  private get contextStream() {
    const stream = this.torus.communicationMux.getStream('app_context');

    if (typeof stream === 'symbol') {
      throw new Error('Symbol streams are not supported');
    }

    return stream;
  }

  subscribe(eventName: WalletEvent, listener: (...args: any[]) => void) {
    this.eventEmitter.on(eventName, listener);

    return () => {
      this.eventEmitter.off(eventName, listener);
    };
  }

  async init({
    network,
    context,
    biconomy,
    popupMode = 'modal',
    connectOptions = {},
    appId = this.options.appId,
    sessionNamespace = this.options.sessionNamespace,
    env = this.options.env || 'prod',
    clientVersion = this.options.clientVersion,
  }: WalletInitOptions = {}) {
    this.connectOptions = connectOptions;
    this.defaultContext = createContext(context);
    this.defaultContext.app.appId ||= appId;

    const { sessionId } = getAuthRedirectResult();

    try {
      this.setStatus('initializing');

      await this.torus.init({
        network,
        sessionId,
        popupMode,
        biconomy,
        sessionNamespace,
        context: this.defaultContext,
        buildEnv: buildEnvMap[env],
        enableLogging: env !== 'prod',
        integrity: {
          check: false,
          version: clientVersion,
        },
      });

      this.proxyProvider.setTarget(this.torus.provider);
      this.setStatus(this.torus.isLoggedIn ? 'connected' : 'ready');

      this.onAfterInit?.();
    } catch (error) {
      this.setStatus('errored');
      this.onAfterInit?.(error);

      throw error;
    }
  }

  async connect(overrideOptions: WalletConnectOptions = {}) {
    const { redirectUrl, mode, ...options } = { ...this.connectOptions, ...overrideOptions };
    const rollback = this.setStatus('connecting');

    try {
      const [address] = await this.torus.login({
        verifier: this.torus.currentVerifier || 'unknown',
        login_hint: options.loginHint,
        loginOptions: {
          ...options,
          uxMode: mode || 'modal',
          redirectUrl: mode === 'redirect' ? redirectUrl || window.location.href : undefined,
        },
      });

      this.setStatus('connected');

      return address;
    } catch (error) {
      rollback();

      throw error;
    }
  }

  async disconnect() {
    const rollback = this.setStatus('disconnecting');

    try {
      await this.torus.logout();
      this.setStatus('ready');
    } catch (error) {
      rollback();

      throw error;
    }
  }

  async getUserInfo(): Promise<UserInfo> {
    const torusUserInfo: unknown = await this.torus.getUserInfo('');
    const { email, name, profileImage, isNewUser } = torusUserInfo as UserInfo;

    return {
      email,
      name,
      profileImage,
      isNewUser,
    };
  }

  async showWallet(screen: WalletScreen = 'home', { params, target, onClose }: WalletShowOptions = {}) {
    this.torus.showWallet(screen, params, { target, onClose });
  }

  async setContext(context: PartialContext | null, { key = 'default' }: WalletSetContextOptions = {}) {
    this.contextStream.write({
      name: 'set_context',
      data: {
        key,
        context: createContext(this.defaultContext, context),
      },
    });
  }

  async getAccounts(): Promise<WalletAccount[]> {
    return this.provider.request({ method: 'wallet_accounts' });
  }

  /**
   * Returns universal signer for the requested wallet account
   *
   * @param addressOrOptions - Account address or options to get the signer for
   * @returns `Signer` instance
   *
   * @example
   *
   * ```typescript
   * const signer = wallet.getSigner({ type: 'solana' });
   * const signature = await signer.signMessage('Hello, world!');
   *
   * console.log(signature);
   * ```
   */
  getSigner(addressOrOptions?: SignerOptions | string): SignerInterface {
    const options = typeof addressOrOptions !== 'string' ? addressOrOptions : { address: addressOrOptions };

    return new Signer(this.provider, options);
  }

  /**
   * Currently only CERE transfer supported
   */
  async transfer({ token, type, from, to, amount }: WalletTransferOptions) {
    let fromAddress = from;

    if (token !== 'CERE') {
      throw new Error(`Token "${token}" is not supported`);
    }

    if (!from) {
      const [ethAccount, cereAccount] = await this.getAccounts();

      fromAddress = type === 'native' ? cereAccount?.address : ethAccount?.address;
    }

    if (!fromAddress) {
      throw new Error(`Empty sender address`);
    }

    const decimals = new BN(10); // TODO: Do not hardcode CERE token decimals. Should be returned from the wallet.
    const balance = new BN(amount).mul(new BN(10).pow(decimals));

    return this.provider.request({
      method: type === 'native' ? 'ed25519_transfer' : 'eth_transfer',
      params: [fromAddress, to, balance.toString(), token],
    });
  }

  /**
   * Get the permissions granted by the user
   *
   * @returns A promise that resolves with the permissions granted by the user
   *
   * @example
   *
   * ```typescript
   * const permissions = await wallet.getPermissions();
   *
   * console.log(permissions);
   * ```
   */
  async getPermissions() {
    return this.provider.request<Permission[]>({ method: 'wallet_getPermissions' });
  }

  /**
   * Request permissions from the user
   *
   * @returns A promise that resolves with the permissions granted by the user
   *
   * @example
   *
   * ```typescript
   * const permissions = await wallet.requestPermissions({
   *   'personal_sign': {}, // Request the personal sign permission
   * });
   *
   * console.log(permissions);
   * ```
   */
  async requestPermissions(request: PermissionRequest) {
    return this.provider.request<RequestedPermission>({ method: 'wallet_requestPermissions', params: [request] });
  }

  /**
   * Sends a request to the wallet to revoke permissions.
   *
   * @returns A promise that resolves when the request is complete.
   *
   * @example
   *
   * ```typescript
   * await wallet.revokePermissions({
   *   'personal_sign': {}, // Revoke the personal sign permission
   * });
   * ```
   */
  async revokePermissions(request: PermissionRevokeRequest) {
    return this.provider.request<void>({ method: 'wallet_revokePermissions', params: [request] });
  }
}
