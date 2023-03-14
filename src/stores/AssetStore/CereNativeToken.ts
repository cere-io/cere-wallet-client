import { makeAutoObservable } from 'mobx';
import { fromResource } from 'mobx-utils';
import { BN } from '@polkadot/util';

import { TransferableAsset, ReadyWallet } from './types';

export const convertBalance = (balance: string, decimals: BN) => {
  const divider = new BN(10).pow(decimals);
  const bnBalance = new BN(balance);

  return bnBalance.div(divider).toNumber();
};

const createBalanceResource = ({ engine }: ReadyWallet, address: string, decimals: BN) => {
  let updateBalance: (...args: any) => void;

  return fromResource<number>(
    async (sink) => {
      updateBalance = (balance) => sink(convertBalance(balance, decimals));

      engine.provider.on('ed25519_balanceChanged', updateBalance);
    },
    () => {
      engine.provider.off('ed25519_balanceChanged', updateBalance);
    },
  );
};

export class CereNativeToken implements TransferableAsset {
  private balanceResource = createBalanceResource(this.wallet, this.accountAddress, new BN(this.decimals));

  constructor(private wallet: ReadyWallet) {
    makeAutoObservable(this);
  }

  private get accountAddress() {
    return this.wallet.accounts.find((account) => account.type === 'ed25519')!.address;
  }

  get id() {
    return 'cere-network';
  }

  get displayName() {
    return 'Cere';
  }

  get network() {
    return 'Cere Network';
  }

  get ticker() {
    return 'CERE';
  }

  get decimals() {
    return 10;
  }

  get balance() {
    return this.balanceResource.current();
  }

  async transfer(to: string, value: string) {
    const decimals = new BN(this.decimals);
    const multiple = new BN(10).pow(decimals);
    const amount = new BN(value).mul(multiple);

    return this.wallet.provider.send('ed25519_transfer', [this.accountAddress, to, amount.toString()]);
  }
}
