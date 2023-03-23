import EventEmitter from 'events';
import { Substream } from '@toruslabs/openlogin-jrpc';
import Torus, { TORUS_BUILD_ENV_TYPE, preloadIframe } from '@cere/torus-embed';
import BN from 'bn.js';

import { createContext } from './createContext';
import { getAuthRedirectResult } from './getAuthRedirectResult';
import { ProxyProvider, ProviderInterface } from './Provider';
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
} from './types';

const buildEnvMap: Record<WalletEnvironment, TORUS_BUILD_ENV_TYPE> = {
  local: 'development',
  dev: 'cere-dev',
  stage: 'cere-stage',
  prod: 'cere',
};

const createBalance = (
  token: WalletBalance['token'],
  rawBalance: string,
  rawDecimals: string | number,
): WalletBalance => {
  const decimals = new BN(rawDecimals);
  const balance = new BN(rawBalance);

  return {
    token,
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

  constructor({ env, clientVersion = WALLET_CLIENT_VERSION, ...options }: WalletOptions = {}) {
    if (env) {
      preloadIframe(buildEnvMap[env], clientVersion);
    }

    this.eventEmitter = new EventEmitter();
    this.torus = new Torus();
    this.proxyProvider = new ProxyProvider();
    this.defaultContext = createContext();

    this.provider.on('message', this.handleEvenets);
    this.options = { ...options, clientVersion, env: env || 'prod' };
  }

  private handleEvenets = ({ type, data }: ProviderEvent) => {
    if (type === 'wallet_accountsChanged') {
      this.eventEmitter.emit('accounts-update', data);

      if (!this.torus.isLoggedIn) {
        this.setStatus('ready');
      }
    }

    // TODO: Add for eth balance as well
    if (type === 'ed25519_balanceChanged') {
      this.eventEmitter.emit('balance-update', createBalance('CERE', data.balance, 10)); // TODO: Do not hardcode CERE token decimals. Should be returned from the wallet.
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
    return this.torus.communicationMux.getStream('app_context') as Substream;
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
    popupMode = 'modal',
    connectOptions = {},
    appId = this.options.appId,
    env = this.options.env || 'prod',
    clientVersion = this.options.clientVersion,
  }: WalletInitOptions = {}) {
    this.connectOptions = connectOptions;
    this.defaultContext = createContext(context);
    this.defaultContext.app.appId ||= appId;

    const { sessionId } = getAuthRedirectResult();

    await this.torus.init({
      network,
      sessionId,
      popupMode,
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
  }

  async connect(overrideOptions: WalletConnectOptions = {}) {
    const { redirectUrl, mode, ...options } = { ...this.connectOptions, ...overrideOptions };
    const rollback = this.setStatus('connecting');

    try {
      const [address] = await this.torus.login({
        verifier: this.torus.currentVerifier || 'unknown',
        loginOptions: {
          ...options,
          uxMode: mode,
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
    const { email, name, idToken, profileImage, isNewUser } = torusUserInfo as UserInfo;

    return {
      idToken,
      email,
      name,
      profileImage,
      isNewUser,
    };
  }

  async showWallet(screen: WalletScreen = 'home', { params, target, onClose }: WalletShowOptions = {}) {
    this.torus.showWallet(screen, params, {
      target,
      onClose,
    });
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
   * Currently only CERE transfer supported
   */
  async transfer({ token, from, to, amount }: WalletTransferOptions) {
    let fromAddress = from;

    if (token !== 'CERE') {
      throw new Error(`Token "${token}" is not supported`);
    }

    if (!from) {
      const [, cereAccount] = await this.getAccounts();

      fromAddress = cereAccount?.address;
    }

    if (!fromAddress) {
      throw new Error(`Empty sender address`);
    }

    const decimals = new BN(10); // TODO: Do not hardcode CERE token decimals. Should be returned from the wallet.
    const balance = new BN(amount).mul(new BN(10).pow(decimals));

    return this.provider.request({
      method: 'ed25519_transfer',
      params: [fromAddress, to, balance.toString()],
    });
  }
}
