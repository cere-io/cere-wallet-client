import { keccak256 } from 'js-sha3';
import { injectExtension } from '@polkadot/extension-inject';
import type { Injected, InjectedAccount, InjectedAccounts } from '@polkadot/extension-inject/types';
import type { SignerPayloadRaw, SignerResult, Signer } from '@polkadot/types/types';

import { EmbedWallet } from '../EmbedWallet';

const transformAccounts = (accounts: string[]): InjectedAccount[] =>
  accounts.map((address) => ({
    address,
    name: `Cere wallet`,
    type: 'ed25519',
  }));

export type PolkadotInjectorOptions = {
  name?: string;
  version?: string;
};

export class PolkadotInjector {
  private name: string;
  private version: string;
  private injected: boolean = false;

  constructor(readonly wallet: EmbedWallet, { name, version }: PolkadotInjectorOptions = {}) {
    this.name = name || 'CereWallet';
    this.version = version || '0.0.0';
  }

  get isInjected() {
    return this.injected;
  }

  private getAccounts = async () => {
    const response = await this.wallet.provider.request({
      method: 'ed25519_accounts',
    });

    return transformAccounts(response);
  };

  private subscribeAccounts = (onReceive: (accounts: InjectedAccount[]) => void) => {
    const listener = (accounts: string[]) => onReceive(transformAccounts(accounts));

    this.wallet.provider.on('accountsChanged', listener);

    return () => this.wallet.provider.off('accountsChanged', listener);
  };

  private signRaw = async (raw: SignerPayloadRaw): Promise<SignerResult> => {
    const signature = await this.wallet.provider.request({
      method: 'ed25519_sign',
      params: [raw.address, keccak256(raw.data)],
    });

    return { id: 0, signature };
  };

  private enable = async (): Promise<Injected> => {
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
