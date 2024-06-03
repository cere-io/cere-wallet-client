import { ProviderInterface, SignerInterface } from './Provider';
import type { WalletAccount, WalletAccountType } from './types';

export type SignerOptions = {
  accountIndex?: number;
  address?: string;
  type?: WalletAccountType;
};

export class Signer implements SignerInterface {
  constructor(readonly provider: ProviderInterface, readonly options: SignerOptions = {}) {}

  async getAccount(): Promise<WalletAccount> {
    const { address, type, accountIndex = 0 } = this.options;
    const allAccounts = await this.provider.request({ method: 'wallet_accounts' });
    const accounts = type ? allAccounts.filter((account: WalletAccount) => account.type === type) : allAccounts;

    const account = address
      ? accounts.find((account: WalletAccount) => account.address === address)
      : accounts[accountIndex];

    if (!account) {
      throw new Error('Account not found');
    }

    return account;
  }

  async getAddress(): Promise<string> {
    const { address } = await this.getAccount();

    return address;
  }

  async signMessage(message: string): Promise<string> {
    const account = await this.getAddress();

    return this.provider.request({ method: 'wallet_signMessage', params: [account, message] });
  }
}
