import EventEmitter from 'events';

export type WalletEvent = 'status-update';
export type WalletStatus = 'not-ready' | 'ready' | 'connected' | 'connecting' | 'errored';

export class EmbedWallet {
  private eventEmitter: EventEmitter;
  private currentStatus: WalletStatus = 'not-ready';

  constructor() {
    this.eventEmitter = new EventEmitter();
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
    this.status = 'ready';
  }

  async connect() {
    this.status = 'connected';
  }

  async disconnect() {
    this.status = 'ready';
  }
}
