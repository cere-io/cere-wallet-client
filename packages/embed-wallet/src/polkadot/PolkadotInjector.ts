import { injectExtension } from '@polkadot/extension-inject';
import type { Injected, InjectedAccount, InjectedAccounts } from '@polkadot/extension-inject/types';
import type { SignerPayloadRaw, SignerResult, Signer } from '@polkadot/types/types';

import { EmbedWallet } from '../EmbedWallet';

export type PolkadotInjectorOptions = {
  name?: string;
  version?: string;
  autoConnect?: boolean;
  waitReady?: boolean;
};

export class PolkadotInjector {
  private name: string;
  private version: string;
  private injected: boolean = false;
  private shouldConnect: boolean;
  private shouldWait: boolean;

  constructor(
    readonly wallet: EmbedWallet,
    { name, version, autoConnect = false, waitReady = true }: PolkadotInjectorOptions = {},
  ) {
    this.name = name || 'CereWallet';
    this.version = version || '0.0.0';
    this.shouldConnect = autoConnect;
    this.shouldWait = waitReady;
  }

  get isInjected() {
    return this.injected;
  }

  private waitReady = () =>
    new Promise((resolve) => {
      if (this.wallet.status !== 'not-ready') {
        return resolve(true);
      }

      const unsubscribe = this.wallet.subscribe('status-update', () => {
        if (this.wallet.status !== 'not-ready') {
          resolve(true);
          unsubscribe();
        }
      });
    });

  private getAccounts = async () => {
    return await this.wallet.provider.request({
      method: 'ed25519_accounts',
    });
  };

  private subscribeAccounts = (onReceive: (accounts: InjectedAccount[]) => void) => {
    const listener = (accounts: InjectedAccount[]) => onReceive(accounts);

    this.wallet.provider.on('ed25519_accountsChanged', listener);

    return () => this.wallet.provider.off('ed25519_accountsChanged', listener);
  };

  private signRaw = async (raw: SignerPayloadRaw): Promise<SignerResult> => {
    const signature = await this.wallet.provider.request({
      method: 'ed25519_sign',
      params: [raw.address, raw.data],
    });

    return { id: 0, signature };
  };

  private enable = async (): Promise<Injected> => {
    if (this.shouldWait) {
      await this.waitReady();
    }

    if (this.shouldConnect && this.wallet.status === 'ready') {
      await this.wallet.connect();
    }

    const accounts: InjectedAccounts = {
      get: this.getAccounts,
      subscribe: this.subscribeAccounts,
    };

    const signer: Signer = {
      signRaw: this.signRaw,
    };

    return { accounts, signer };
  };

  inject() {
    injectExtension(this.enable, {
      version: this.version,
      name: this.name,
    });

    this.injected = true;
  }
}
