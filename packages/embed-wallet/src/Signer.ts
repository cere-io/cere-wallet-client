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

    /**
     * TODO: Think about a better approach to compare addresses.
     * Addresses for some chains are case-sensitive, so we need think about a beeter way of comparing it.
     * For now, we just convert both to uppercase to make it work. But this is not a perfect solution.
     * We can keep it for now since there is a very low probability of two addresses that are the same but with different cases.
     */
    const account = address
      ? accounts.find((account: WalletAccount) => account.address.toUpperCase() === address.toUpperCase())
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
