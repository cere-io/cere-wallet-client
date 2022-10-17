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

export type NetworkConfig = Omit<NetworkInterface, 'host'> & {
  host: 'matic' | 'mumbai' | string;
};

export type WalletInitOptions = {
  env?: keyof typeof buildEnvMap;
  network?: NetworkConfig;
};

export class EmbedWallet {
  private torus: Torus;
  private eventEmitter: EventEmitter;
  private currentStatus: WalletStatus = 'not-ready';

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.torus = new Torus();
  }

  private set status(status: WalletStatus) {
    if (this.currentStatus === status) {
      return;
    }

    this.currentStatus = status;
    this.eventEmitter.emit('status-update', this.currentStatus);
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

    this.status = this.torus.isLoggedIn ? 'connected' : 'ready';
  }

  async connect() {
    this.status = 'connecting';
    await this.torus.login({ verifier: 'sdk' });
    this.status = 'connected';
  }

  async disconnect() {
    this.status = 'disconnecting';
    await this.torus.logout();
    this.status = 'ready';
  }
}
