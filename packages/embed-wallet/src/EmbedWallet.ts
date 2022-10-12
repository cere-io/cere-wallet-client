import EventEmitter from 'events';
import Torus, { TorusParams } from '@cere/torus-embed';

export type WalletEvent = 'status-update';
export type WalletStatus = 'not-ready' | 'ready' | 'connected' | 'connecting' | 'errored';

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

  async init() {
    await this.torus.init({
      buildEnv: 'development',
      enableLogging: true,
      loginConfig: {
        cere: {
          name: 'Cere Wallet',
          typeOfLogin: 'jwt',
          jwtParameters: {
            domain: window.origin,
          },
        },
      },
      network: {
        host: 'https://polygon-mumbai.infura.io/v3/248b37a1123943a9b5c975eb2c93a2ab',
        chainId: 80001,
      },
    });

    this.status = 'ready';
  }

  async connect() {
    this.status = 'connecting';
    await this.torus.login({ verifier: 'cere' });
    this.status = 'connected';
  }

  async disconnect() {
    this.torus.logout();
    this.status = 'ready';
  }
}
