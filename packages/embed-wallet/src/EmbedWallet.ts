import EventEmitter from 'events';
import Torus, { TorusParams } from '@cere/torus-embed';

const buildEnvMap = {
  local: 'development',
  dev: 'cere-dev',
  stage: 'cere-stage',
  prod: 'cere',
} as const;

export type WalletEvent = 'status-update';
export type WalletStatus = 'not-ready' | 'ready' | 'connected' | 'connecting' | 'disconnecting' | 'errored';
export type WalletInitOptions = {
  env?: keyof typeof buildEnvMap;
  network: TorusParams['network'];
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
      loginConfig: {
        cere: {
          name: 'Cere Wallet',
          typeOfLogin: 'jwt',
        },
      },
    });

    this.status = this.torus.isLoggedIn ? 'connected' : 'ready';
  }

  async connect() {
    this.status = 'connecting';
    await this.torus.login({ verifier: 'cere' });
    this.status = 'connected';
  }

  async disconnect() {
    this.status = 'disconnecting';
    await this.torus.logout();
    this.status = 'ready';
  }
}
