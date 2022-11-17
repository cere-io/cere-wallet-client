import { EventEmitter } from 'events';
import { TorusInpageProvider } from '@cere/torus-embed';

interface RequestArguments {
  readonly method: string;
  readonly params?: unknown[] | Record<string, unknown>;
}

/**
 * EIP-1193 compatible provider with some Cere specific extensions
 */
export interface ProviderInterface extends EventEmitter {
  readonly isConnected: boolean;

  request<T = any>({ method, params }: RequestArguments): Promise<T>;
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
}
