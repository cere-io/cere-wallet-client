import { EmbedWallet, PermissionRequest, WalletAccount } from '@cere/embed-wallet';
import { injectExtension } from '@polkadot/extension-inject';
import type { Injected, InjectedAccount, InjectedAccounts } from '@polkadot/extension-inject/types';
import type { SignerPayloadRaw, SignerResult, Signer, SignerPayloadJSON } from '@polkadot/types/types';

export type PolkadotInjectorOptions = {
  name?: string;
  version?: string;
  autoConnect?: boolean;
  waitReady?: boolean;
  permissions?: PermissionRequest;
};

export class PolkadotInjector {
  private name: string;
  private version: string;
  private injected: boolean = false;
  private shouldConnect: boolean;
  private shouldWait: boolean;
  private permissions?: PermissionRequest;

  constructor(
    readonly wallet: EmbedWallet,
    { name, version, autoConnect = false, waitReady = true, permissions }: PolkadotInjectorOptions = {},
  ) {
    this.name = name || 'Cere Wallet';
    this.version = version || '0.0.0';
    this.shouldConnect = autoConnect;
    this.shouldWait = waitReady;
    this.permissions = permissions;
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

  private filterAccounts = (accounts: WalletAccount[]) => {
    return accounts.filter((account: WalletAccount) => account.type === 'ed25519') as InjectedAccount[];
  };

  private getAccounts = async () => {
    const allAccounts = await this.wallet.provider.request({
      method: 'wallet_accounts',
    });

    return this.filterAccounts(allAccounts);
  };

  private subscribeAccounts = (onReceive: (accounts: InjectedAccount[]) => void) => {
    const listener = (accounts: WalletAccount[]) => onReceive(this.filterAccounts(accounts));

    this.wallet.provider.on('wallet_accountsChanged', listener);

    return () => this.wallet.provider.off('wallet_accountsChanged', listener);
  };

  private signRaw = async (raw: SignerPayloadRaw): Promise<SignerResult> => {
    const signature = await this.wallet.provider.request({
      method: 'ed25519_signRaw',
      params: [raw.address, raw.data],
    });

    return { id: 0, signature };
  };

  private signPayload = async (payload: SignerPayloadJSON): Promise<SignerResult> => {
    const signature = await this.wallet.provider.request({
      method: 'ed25519_signPayload',
      params: [payload],
    });

    return { id: 0, signature };
  };

  private enable = async (): Promise<Injected> => {
    if (this.shouldWait) {
      await this.waitReady();
    }

    if (this.shouldConnect && this.wallet.status === 'ready') {
      await this.wallet.connect({
        permissions: this.permissions,
      });
    } else if (this.wallet.status === 'connected' && this.permissions) {
      await this.wallet.requestPermissions(this.permissions).catch(console.warn);
    }

    const accounts: InjectedAccounts = {
      get: this.getAccounts,
      subscribe: this.subscribeAccounts,
    };

    const signer: Signer = {
      signRaw: this.signRaw,
      signPayload: this.signPayload,
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
