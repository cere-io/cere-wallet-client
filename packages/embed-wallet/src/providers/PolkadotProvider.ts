import { CereProvider } from './CereProvider';

export class PolkadotProvider {
  constructor(private provider: CereProvider) {}

  get isClonable() {
    return false;
  }

  get hasSubscriptions() {
    return false;
  }

  get isConnected() {
    return this.provider.isConnected;
  }

  on(type: string, sub: (value?: any) => any): () => void {
    this.provider.on(type, sub);

    return () => this.provider.off(type, sub);
  }

  clone(): PolkadotProvider {
    throw new Error('The provider is not clonable');
  }

  connect(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  disconnect(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async send<T = any>(method: string, params: unknown[], isCacheable?: boolean | undefined): Promise<T> {
    return this.provider.request({ method, params }) as Promise<T>;
  }

  subscribe(
    type: string,
    method: string,
    params: unknown[],
    cb: (error: Error | null, result: any) => void,
  ): Promise<string | number> {
    throw new Error('Method not implemented.');
  }

  unsubscribe(type: string, method: string, id: string | number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
