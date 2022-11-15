import EventEmitter from 'events';
import { Substream } from '@toruslabs/openlogin-jrpc';
import Torus, { TORUS_BUILD_ENV_TYPE } from '@cere/torus-embed';

import { createContext } from './createContext';
import { getAuthRedirectResult } from './getAuthRedirectResult';
import { ProxyProvider, ProviderInterface } from './Provider';
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
} from './types';

const buildEnvMap: Record<WalletEnvironment, TORUS_BUILD_ENV_TYPE> = {
  local: 'development',
  dev: 'cere-dev',
  stage: 'cere-stage',
  prod: 'cere',
};

export class EmbedWallet {
  private torus: Torus;
  private eventEmitter: EventEmitter;
  private currentStatus: WalletStatus = 'not-ready';
  private defaultContext: Context;
  private proxyProvider: ProxyProvider;
  private connectOptions: WalletConnectOptions = {};

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.torus = new Torus();
    this.proxyProvider = new ProxyProvider();
    this.defaultContext = createContext();
  }

  private setStatus(status: WalletStatus) {
    const prevStatus = this.currentStatus;

    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.eventEmitter.emit('status-update', this.currentStatus);
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

  async init({ network, context, env = 'prod', popupMode = 'modal', connectOptions = {} }: WalletInitOptions = {}) {
    this.connectOptions = connectOptions;
    this.defaultContext = createContext(context);
    const { sessionId } = getAuthRedirectResult();

    await this.torus.init({
      network,
      sessionId,
      popupMode,
      context: this.defaultContext,
      buildEnv: buildEnvMap[env],
      enableLogging: env !== 'prod',
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
    const { email, name, idToken, profileImage } = torusUserInfo as UserInfo;

    return {
      idToken,
      email,
      name,
      profileImage,
    };
  }

  async showWallet(screen: WalletScreen = 'home', { params, target, onClose }: WalletShowOptions = {}) {
    this.torus.showWallet(screen, params, {
      target,
      onClose,
    });
  }

  async setContext(context: Context | null, { key = 'default' }: WalletSetContextOptions = {}) {
    this.contextStream.write({
      name: 'set_context',
      data: {
        key,
        context: createContext(this.defaultContext, context),
      },
    });
  }
}
