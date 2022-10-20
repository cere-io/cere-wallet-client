import EventEmitter from 'events';
import Torus, { NetworkInterface } from '@cere/torus-embed';

const buildEnvMap = {
  local: 'development',
  dev: 'cere-dev',
  stage: 'cere-stage',
  prod: 'cere',
} as const;

export type WalletEvent = 'status-update';
export type WalletStatus = 'not-ready' | 'ready' | 'connected' | 'connecting' | 'disconnecting' | 'errored';
export type WalletScreen = 'home' | 'topup' | 'settings';
export type UserInfo = {
  email: string;
  name: string;
  profileImage: string;
  idToken: string;
};

export type NetworkConfig = Omit<NetworkInterface, 'host'> & {
  host: 'matic' | 'mumbai' | string;
};

export type WalletInitOptions = {
  env?: keyof typeof buildEnvMap;
  network?: NetworkConfig;
};

export type WalletConnectOptions = {
  idToken?: string;
  mode?: 'redirect' | 'popup';
  redirectUrl?: string;
};

export class EmbedWallet {
  private torus: Torus;
  private eventEmitter: EventEmitter;
  private currentStatus: WalletStatus = 'not-ready';

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.torus = new Torus();
  }

  private setStatus(status: WalletStatus) {
    const prevStatus = this.currentStatus;

    if (this.currentStatus !== status) {
      this.currentStatus = status;
      this.eventEmitter.emit('status-update', this.currentStatus);
    }

    return () => this.setStatus(prevStatus);
  }

  get status() {
    return this.currentStatus;
  }

  get provider() {
    return this.torus.provider;
  }

  subscribe(eventName: WalletEvent, listener: (...args: any[]) => void) {
    this.eventEmitter.on(eventName, listener);

    return () => {
      this.eventEmitter.off(eventName, listener);
    };
  }

  async init({ network, env = 'prod' }: WalletInitOptions) {
    await this.torus.init({
      network,
      buildEnv: buildEnvMap[env],
      enableLogging: env !== 'prod',
    });

    this.setStatus(this.torus.isLoggedIn ? 'connected' : 'ready');
  }

  async connect({ redirectUrl, mode, ...options }: WalletConnectOptions = {}) {
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

  async showWallet(screen: WalletScreen = 'home', params?: Record<string, string>) {
    this.torus.showWallet(screen, params);
  }
}
