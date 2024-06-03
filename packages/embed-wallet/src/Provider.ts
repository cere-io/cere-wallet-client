import { EventEmitter } from 'events';
import { TorusInpageProvider } from '@cere/torus-embed';
import { Signer, SignerOptions } from './Signer';
import { WalletAccount } from './types';

interface RequestArguments {
  readonly method: string;
  readonly params?: unknown[] | Record<string, unknown>;
}

export interface SignerInterface {
  getAccount(): Promise<WalletAccount>;
  getAddress(): Promise<string>;
  signMessage(message: string): Promise<string>;
}

/**
 * EIP-1193 compatible provider with some Cere specific extensions
 */
export interface ProviderInterface extends EventEmitter {
  readonly isConnected: boolean;

  request<T = any>({ method, params }: RequestArguments): Promise<T>;

  /**
   * Get a signer for a specific account
   *
   * @param addressOrIndex - Account address or index
   *
   * @returns Signer instance
   */
  getSigner(addressOrIndex: string | number): SignerInterface;
}

export class ProxyProvider extends EventEmitter implements ProviderInterface {
  protected provider?: TorusInpageProvider;

  get isConnected() {
    return this.provider?.isConnected() || false;
  }

  async request<T = any>({ method, params }: RequestArguments) {
    if (!this.provider) {
      throw new Error('Provider is not yet ready send requests');
    }

    return this.provider.request({ method, params }) as Promise<T>;
  }

  setTarget(provider: TorusInpageProvider) {
    this.provider = provider;

    this.eventNames().forEach((event) =>
      this.listeners(event).forEach((listener) => {
        provider.addListener(event as string, listener as () => void);
      }),
    );

    this.on('newListener', provider.on.bind(provider));
    this.on('removeListener', provider.off.bind(provider));
  }

  getSigner(addressOrIndex?: string | number): SignerInterface {
    const options: SignerOptions = {
      accountIndex: 0,
    };

    if (typeof addressOrIndex === 'string') {
      options.address = addressOrIndex;
    }

    if (typeof addressOrIndex === 'number') {
      options.accountIndex = addressOrIndex;
    }

    return new Signer(this, options);
  }
}
